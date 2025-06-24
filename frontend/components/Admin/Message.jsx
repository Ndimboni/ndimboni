import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Select,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Popconfirm,
  Typography,
  Badge,
  Tooltip,
  Pagination,
  Spin,
  Alert,
} from "antd";
import {
  MessageOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ContactMessagesPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });

  const [statusFormData, setStatusFormData] = useState({});

  const [userRole, setUserRole] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const API_BASE_URL = "https://ndimboniapi.ini.rw";

  const checkAuthorization = () => {
    if (typeof window === "undefined") return false;

    try {
      const userRole = localStorage.getItem("user_role");
      const accessToken = localStorage.getItem("access_token");

      console.log(
        "Checking auth - Role:",
        userRole,
        "Token exists:",
        !!accessToken
      );

      if (!userRole || !accessToken) {
        return false;
      }

      return userRole === "admin" || userRole === "moderator";
    } catch (error) {
      console.error("Error checking authorization:", error);
      return false;
    }
  };

  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};

    const token = localStorage.getItem("access_token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchContacts = async () => {
    if (!isAuthorized) return;

    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const queryParams = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.pageSize.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`${API_BASE_URL}/contact?${queryParams}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }

      const data = await response.json();
      setContacts(data.contacts || []);
      setPagination((prev) => ({
        ...prev,
        total: data.total || 0,
      }));
    } catch (error) {
      message.error("Failed to fetch contact messages");
      console.error("Error fetching contacts:", error);
      setError("Failed to load contact messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAuthorized) return;

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/contact/stats`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    try {
      await Promise.all([fetchContacts(), fetchStats()]);
      message.success("Data refreshed successfully");
    } catch (error) {
      message.error("Failed to refresh data");
    } finally {
      setRefreshLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);

    const timeoutId = setTimeout(() => {
      const authorized = checkAuthorization();
      const role = localStorage.getItem("user_role");

      setUserRole(role || "");
      setIsAuthorized(authorized);
      setAuthChecked(true);

      if (authorized) {
        fetchContacts();
        fetchStats();
      } else {
        setLoading(false);
        setError("Unauthorized access. Admin or moderator role required.");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isAuthorized && isClient && authChecked) {
      fetchContacts();
      fetchStats();
    }
  }, [
    pagination.current,
    pagination.pageSize,
    filters,
    isAuthorized,
    isClient,
    authChecked,
  ]);

  const handleStatusUpdate = async (id, values) => {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/contact/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      message.success("Status updated successfully");
      setEditModalVisible(false);
      fetchContacts();
      fetchStats();
    } catch (error) {
      message.error("Failed to update status");
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (userRole !== "admin") {
      message.error("Only admins can delete messages");
      return;
    }

    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }

      message.success("Contact message deleted successfully");
      fetchContacts();
      fetchStats();
    } catch (error) {
      message.error("Failed to delete contact message");
      console.error("Error deleting contact:", error);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "orange",
        icon: <ClockCircleOutlined />,
        text: "Pending",
      },
      in_progress: {
        color: "blue",
        icon: <ExclamationCircleOutlined />,
        text: "In Progress",
      },
      resolved: {
        color: "green",
        icon: <CheckCircleOutlined />,
        text: "Resolved",
      },
      closed: { color: "red", icon: <CloseCircleOutlined />, text: "Closed" },
    };
    return configs[status] || configs.pending;
  };

  const getCategoryColor = (category) => {
    const colors = {
      general_inquiry: "blue",
      technical_support: "green",
      bug_report: "red",
      feature_request: "purple",
      complaint: "orange",
      other: "gray",
    };
    return colors[category] || "gray";
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            <MailOutlined /> {record.email}
          </Text>
        </div>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 200, display: "block" }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => (
        <Tag color={getCategoryColor(category)}>
          {category?.replace("_", " ").toUpperCase() || "GENERAL"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Badge
            status={
              config.color === "green"
                ? "success"
                : config.color === "red"
                ? "error"
                : "processing"
            }
            text={
              <span style={{ color: config.color }}>
                {config.icon} {config.text}
              </span>
            }
          />
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div>
          <Text>{new Date(date).toLocaleDateString()}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {new Date(date).toLocaleTimeString()}
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedContact(record);
                setViewModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedContact(record);
                setStatusFormData({
                  status: record.status,
                  adminResponse: record.adminResponse || "",
                });
                setEditModalVisible(true);
              }}
            />
          </Tooltip>
          {userRole === "admin" && (
            <Tooltip title="Delete">
              <Popconfirm
                title="Are you sure you want to delete this message?"
                onConfirm={() => handleDelete(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  if (!isClient || !authChecked) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Access Denied"
          description="You don't have permission to access this page. Admin or moderator role required."
          type="error"
          showIcon
          action={
            <button
              onClick={() => {
                const authorized = checkAuthorization();
                const role = localStorage.getItem("user_role");
                setUserRole(role || "");
                setIsAuthorized(authorized);
                if (authorized) {
                  fetchContacts();
                  fetchStats();
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "#1890ff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Check Again
            </button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Error Loading Contact Messages"
          description={error}
          type="error"
          showIcon
          action={
            <button
              onClick={() => {
                fetchContacts();
                fetchStats();
              }}
              style={{
                background: "none",
                border: "none",
                color: "#1890ff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: window.innerWidth <= 768 ? "12px" : "24px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{ marginBottom: window.innerWidth <= 768 ? "16px" : "32px" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: window.innerWidth <= 768 ? "flex-start" : "center",
              flexDirection: window.innerWidth <= 768 ? "column" : "row",
              marginBottom: "24px",
              gap: window.innerWidth <= 768 ? "12px" : "0",
            }}
          >
            <div>
              <Title
                level={window.innerWidth <= 768 ? 3 : 2}
                style={{ marginBottom: "8px" }}
              >
                <MessageOutlined style={{ marginRight: "8px" }} />
                Contact Messages
              </Title>
              <Text type="secondary">
                Manage and respond to contact messages from users
              </Text>
            </div>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshLoading}
              size={window.innerWidth <= 768 ? "middle" : "default"}
              style={{ width: window.innerWidth <= 768 ? "100%" : "auto" }}
            >
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <Row gutter={[12, 12]} style={{ marginBottom: "24px" }}>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card size="small">
                <Statistic
                  title="Total Messages"
                  value={stats.total || 0}
                  prefix={<MessageOutlined />}
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: window.innerWidth <= 768 ? "18px" : "24px",
                  }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card size="small">
                <Statistic
                  title="Pending"
                  value={stats.pending || 0}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{
                    color: "#faad14",
                    fontSize: window.innerWidth <= 768 ? "18px" : "24px",
                  }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card size="small">
                <Statistic
                  title="In Progress"
                  value={stats.inProgress || 0}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{
                    color: "#1890ff",
                    fontSize: window.innerWidth <= 768 ? "18px" : "24px",
                  }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6}>
              <Card size="small">
                <Statistic
                  title="Resolved"
                  value={stats.resolved || 0}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{
                    color: "#52c41a",
                    fontSize: window.innerWidth <= 768 ? "18px" : "24px",
                  }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: "24px" }} size="small">
          <div style={{ marginBottom: "16px" }}>
            <Title level={4} style={{ marginBottom: "0" }}>
              <FilterOutlined style={{ marginRight: "8px" }} />
              Filters & Search
            </Title>
          </div>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={24} md={12} lg={8}>
              <div style={{ marginBottom: "8px" }}>
                <Text strong>Search Messages</Text>
              </div>
              <Input
                placeholder="Search by name, email, or subject"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={4}>
              <div style={{ marginBottom: "8px" }}>
                <Text strong>Filter by Status</Text>
              </div>
              <Select
                placeholder="All Statuses"
                value={filters.status}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="pending">Pending</Option>
                <Option value="in_progress">In Progress</Option>
                <Option value="resolved">Resolved</Option>
                <Option value="closed">Closed</Option>
              </Select>
            </Col>
            <Col xs={12} sm={12} md={6} lg={4}>
              <div style={{ marginBottom: "8px" }}>
                <Text strong>Filter by Category</Text>
              </div>
              <Select
                placeholder="All Categories"
                value={filters.category}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
                style={{ width: "100%" }}
                allowClear
              >
                <Option value="general_inquiry">General Inquiry</Option>
                <Option value="technical_support">Technical Support</Option>
                <Option value="bug_report">Bug Report</Option>
                <Option value="feature_request">Feature Request</Option>
                <Option value="complaint">Complaint</Option>
                <Option value="other">Other</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={contacts}
              rowKey="id"
              pagination={false}
              scroll={{ x: 800 }}
              size={window.innerWidth <= 768 ? "small" : "default"}
            />
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                showSizeChanger={window.innerWidth > 768}
                showQuickJumper={window.innerWidth > 768}
                showTotal={(total, range) =>
                  window.innerWidth <= 768
                    ? `${range[0]}-${range[1]} of ${total}`
                    : `${range[0]}-${range[1]} of ${total} items`
                }
                onChange={(page, pageSize) => {
                  setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize,
                  }));
                }}
                size={window.innerWidth <= 768 ? "small" : "default"}
              />
            </div>
          </Spin>
        </Card>

        {/* View Modal */}
        <Modal
          title="Contact Message Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={window.innerWidth <= 768 ? "95%" : 800}
        >
          {selectedContact && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text strong>Name:</Text>
                    <br />
                    <Text>{selectedContact.name}</Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div style={{ marginBottom: "16px" }}>
                    <Text strong>Email:</Text>
                    <br />
                    <Text>{selectedContact.email}</Text>
                  </div>
                </Col>
              </Row>

              {selectedContact.phone && (
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Phone:</Text>
                  <br />
                  <Text>{selectedContact.phone}</Text>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <Text strong>Subject:</Text>
                <br />
                <Text>{selectedContact.subject}</Text>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Text strong>Category:</Text>
                <br />
                <Tag color={getCategoryColor(selectedContact.category)}>
                  {selectedContact.category?.replace("_", " ").toUpperCase()}
                </Tag>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Text strong>Status:</Text>
                <br />
                {(() => {
                  const config = getStatusConfig(selectedContact.status);
                  return (
                    <Badge
                      status={
                        config.color === "green"
                          ? "success"
                          : config.color === "red"
                          ? "error"
                          : "processing"
                      }
                      text={
                        <span style={{ color: config.color }}>
                          {config.icon} {config.text}
                        </span>
                      }
                    />
                  );
                })()}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <Text strong>Message:</Text>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                  }}
                >
                  <Paragraph>{selectedContact.message}</Paragraph>
                </div>
              </div>

              {selectedContact.adminResponse && (
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Admin Response:</Text>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "12px",
                      backgroundColor: "#e6f7ff",
                      borderRadius: "4px",
                    }}
                  >
                    <Paragraph>{selectedContact.adminResponse}</Paragraph>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <Text strong>Submitted:</Text>
                <br />
                <Text type="secondary">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </Text>
              </div>

              {selectedContact.respondedAt && (
                <div style={{ marginBottom: "16px" }}>
                  <Text strong>Responded:</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(selectedContact.respondedAt).toLocaleString()}
                  </Text>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Edit Status Modal */}
        <Modal
          title="Update Contact Status"
          open={editModalVisible}
          onCancel={() => setEditModalVisible(false)}
          onOk={() => {
            const statusSelect = document.getElementById("status-select");
            const responseTextarea = document.getElementById("admin-response");

            if (!statusSelect?.value) {
              message.error("Please select a status");
              return;
            }

            const values = {
              status: statusSelect.value,
              ...(responseTextarea?.value && {
                adminResponse: responseTextarea.value,
              }),
            };

            handleStatusUpdate(selectedContact.id, values);
          }}
          confirmLoading={loading}
          width={window.innerWidth <= 768 ? "95%" : 520}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px",
                }}
              >
                Status <span style={{ color: "#ff4d4f" }}>*</span>
              </label>
              <select
                id="status-select"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                  outline: "none",
                }}
                defaultValue={statusFormData.status}
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 500,
                  marginBottom: "8px",
                }}
              >
                Admin Response
              </label>
              <textarea
                id="admin-response"
                rows={4}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                  outline: "none",
                  resize: "vertical",
                }}
                placeholder="Enter your response to the user (optional)"
                defaultValue={statusFormData.adminResponse || ""}
              />
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ContactMessagesPage;
