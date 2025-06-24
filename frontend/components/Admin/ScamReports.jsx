import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  Space,
  Tag,
  message,
  Row,
  Col,
  Statistic,
  Alert,
  Typography,
  Popconfirm,
  Drawer,
  List,
  Badge,
  Form,
} from "antd";
import {
  UserAddOutlined,
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  SafetyOutlined,
  WarningOutlined,
  ShareAltOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const API_BASE_URL = "https://ndimboniapi.ini.rw/api/scammer-reports";

const ScammerType = {
  EMAIL: "email",
  PHONE: "phone",
  SOCIAL_MEDIA: "social_media",
  WEBSITE: "website",
  OTHER: "other",
};

const ScammerStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  FALSE_POSITIVE: "false_positive",
  INVESTIGATING: "investigating",
};

const ScammerReportPage = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [reportFormData, setReportFormData] = useState({
    type: "",
    identifier: "",
    description: "",
    additionalInfo: "",
    source: "web",
  });

  const [checkFormData, setCheckFormData] = useState({
    type: "",
    identifier: "",
  });

  const [reportForm] = Form.useForm();
  const [checkForm] = Form.useForm();

  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      setAuthError(true);
      return { "Content-Type": "application/json" };
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = getAuthHeaders();

      const config = {
        method: "GET",
        headers,
        ...options,
      };

      if (
        options.body &&
        (config.method === "POST" || config.method === "PUT")
      ) {
        config.body = JSON.stringify(options.body);
      }

      console.log("API Call:", {
        url,
        method: config.method,
        headers: config.headers,
        body: config.body,
      });

      const response = await fetch(url, config);

      if (response.status === 401) {
        setAuthError(true);
        throw new Error("Unauthorized access");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes("Unauthorized")) {
        setAuthError(true);
      }
      console.error("API Call Error:", error);
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const response = await apiCall("/stats");
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
      if (!authError) {
        message.error("Failed to fetch statistics");
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        offset: ((page - 1) * pagination.pageSize).toString(),
      });

      const response = await apiCall(`/all?${params.toString()}`);

      if (response.success) {
        setReports(response.data.data || response.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: response.data.total || response.total || 0,
        }));
      }
    } catch (error) {
      console.error("Reports fetch error:", error);
      if (!authError) {
        message.error("Failed to fetch reports");
      }
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async (formData) => {
    try {
      if (!formData.type || !formData.identifier || !formData.description) {
        message.error("Please fill in all required fields");
        return;
      }

      if (formData.description.length < 10) {
        message.error("Description must be at least 10 characters");
        return;
      }

      const requestData = {
        type: formData.type,
        identifier: formData.identifier.trim(),
        description: formData.description.trim(),
        additionalInfo: formData.additionalInfo
          ? formData.additionalInfo.trim()
          : undefined,
        source: formData.source || "web",
      };

      Object.keys(requestData).forEach((key) => {
        if (requestData[key] === undefined || requestData[key] === "") {
          delete requestData[key];
        }
      });

      console.log("Submitting report:", requestData);

      const response = await apiCall("/report", {
        method: "POST",
        body: requestData,
      });

      if (response.success || response.data) {
        message.success("Scammer reported successfully");
        setReportModalVisible(false);
        setReportFormData({
          type: "",
          identifier: "",
          description: "",
          additionalInfo: "",
          source: "web",
        });
        reportForm.resetFields();
        fetchReports();
        fetchStats();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Submit report error:", error);
      message.error(`Failed to report scammer: ${error.message}`);
    }
  };

  const checkScammer = async (formData) => {
    try {
      if (!formData.type || !formData.identifier) {
        message.error("Please fill in all required fields");
        return;
      }

      const requestData = {
        type: formData.type,
        identifier: formData.identifier.trim(),
      };

      console.log("Checking scammer:", requestData);

      const response = await apiCall("/check", {
        method: "POST",
        body: requestData,
      });

      if (response.success || response.data) {
        setCheckResult(response);
        message.success("Check completed");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Check scammer error:", error);
      message.error(`Failed to check scammer: ${error.message}`);
    }
  };

  const fetchReportDetails = async (id) => {
    try {
      const response = await apiCall(`/report/${id}`);
      if (response.success || response.data) {
        setSelectedReport(response.data || response);
        setDetailsDrawerVisible(true);
      }
    } catch (error) {
      console.error("Fetch details error:", error);
      message.error("Failed to fetch report details");
    }
  };

  const deleteReport = async (id) => {
    try {
      const response = await apiCall(`/report/${id}/delete`, {
        method: "POST",
      });

      if (response.success) {
        message.success("Report deleted successfully");
        fetchReports();
        fetchStats();
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Failed to delete report");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [ScammerStatus.PENDING]: "orange",
      [ScammerStatus.VERIFIED]: "red",
      [ScammerStatus.FALSE_POSITIVE]: "green",
      [ScammerStatus.INVESTIGATING]: "blue",
    };
    return colors[status] || "gray";
  };

  const getTypeIcon = (type) => {
    const icons = {
      [ScammerType.EMAIL]: <MailOutlined />,
      [ScammerType.PHONE]: <PhoneOutlined />,
      [ScammerType.SOCIAL_MEDIA]: <ShareAltOutlined />,
      [ScammerType.WEBSITE]: <GlobalOutlined />,
      [ScammerType.OTHER]: <SafetyOutlined />,
    };
    return icons[type] || <UserAddOutlined />;
  };

  const getTypeDisplayName = (type) => {
    const displayNames = {
      [ScammerType.EMAIL]: "Email",
      [ScammerType.PHONE]: "Phone",
      [ScammerType.SOCIAL_MEDIA]: "Social Media",
      [ScammerType.WEBSITE]: "Website",
      [ScammerType.OTHER]: "Other",
    };
    return displayNames[type] || type;
  };

  const columns = [
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => (
        <Tag icon={getTypeIcon(type)} color="blue">
          {getTypeDisplayName(type)}
        </Tag>
      ),
    },
    {
      title: "Contact Info",
      dataIndex: "identifier",
      key: "identifier",
      render: (identifier) => <Text code>{identifier}</Text>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description) => <Text>{description}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status?.toUpperCase() || "PENDING"}
        </Tag>
      ),
    },
    {
      title: "Report Count",
      dataIndex: "reportCount",
      key: "reportCount",
      width: 100,
      render: (count) => <Badge count={count || 1} showZero />,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => fetchReportDetails(record.id)}
          />
          <Popconfirm
            title="Delete this report?"
            onConfirm={() => deleteReport(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    if (!authError) {
      fetchStats();
      fetchReports();
    }
  }, [authError]);

  if (authError) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Authentication Required"
          description="Please log in to access this page."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Scammer Report Management</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Reports"
              value={stats?.totalReports || 0}
              loading={statsLoading}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Verified Scammers"
              value={stats?.verifiedReports || 0}
              valueStyle={{ color: "#cf1322" }}
              loading={statsLoading}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={stats?.pendingReports || 0}
              valueStyle={{ color: "#fa8c16" }}
              loading={statsLoading}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="False Positives"
              value={stats?.falsePositiveReports || 0}
              valueStyle={{ color: "#3f8600" }}
              loading={statsLoading}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card>
        <div style={{ marginBottom: "16px" }}>
          <Row justify="space-between" align="middle" gutter={[16, 8]}>
            <Col xs={24} sm={12}>
              <Title level={4} style={{ marginBottom: 0 }}>
                Reported Scammers
              </Title>
            </Col>

            <Col xs={24} sm={12}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  justifyContent: "flex-start",
                }}
              >
                <Button
                  icon={<SearchOutlined />}
                  onClick={() => setCheckModalVisible(true)}
                  style={{
                    flex: "1 1 auto",
                    minWidth: "120px",
                    maxWidth: "150px",
                  }}
                >
                  Check
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchReports()}
                  loading={loading}
                  style={{ flex: "0 0 auto", minWidth: "80px" }}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setReportModalVisible(true)}
                  style={{
                    flex: "1 1 auto",
                    minWidth: "120px",
                    maxWidth: "150px",
                  }}
                >
                  Report
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={reports}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} reports`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, pageSize }));
              fetchReports(page);
            },
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Report Scammer Modal  */}
      <Modal
        title="Report a Scammer"
        open={reportModalVisible}
        onCancel={() => {
          setReportModalVisible(false);
          setReportFormData({
            type: "",
            identifier: "",
            description: "",
            additionalInfo: "",
            source: "web",
          });
        }}
        footer={null}
        width={600}
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Scam Type *
            </label>
            <Select
              placeholder="Select scam type"
              style={{ width: "100%" }}
              value={reportFormData.type}
              onChange={(value) =>
                setReportFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <Option value={ScammerType.EMAIL}>Email</Option>
              <Option value={ScammerType.PHONE}>Phone</Option>
              <Option value={ScammerType.SOCIAL_MEDIA}>Social Media</Option>
              <Option value={ScammerType.WEBSITE}>Website</Option>
              <Option value={ScammerType.OTHER}>Other</Option>
            </Select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Contact Information *
            </label>
            <Input
              placeholder="Enter email, phone, username, or website"
              value={reportFormData.identifier}
              onChange={(e) =>
                setReportFormData((prev) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Description *
            </label>
            <TextArea
              rows={4}
              placeholder="Describe how this scammer tried to deceive you..."
              value={reportFormData.description}
              onChange={(e) =>
                setReportFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Additional Information
            </label>
            <TextArea
              rows={3}
              placeholder="Any additional details about this scammer..."
              value={reportFormData.additionalInfo}
              onChange={(e) =>
                setReportFormData((prev) => ({
                  ...prev,
                  additionalInfo: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setReportModalVisible(false);
                  setReportFormData({
                    type: "",
                    identifier: "",
                    description: "",
                    additionalInfo: "",
                    source: "web",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => submitReport(reportFormData)}
              >
                Report Scammer
              </Button>
            </Space>
          </div>
        </div>
      </Modal>

      {/* Check Scammer Modal - FIXED: Using correct field names */}
      <Modal
        title="Check if Scammer"
        open={checkModalVisible}
        onCancel={() => {
          setCheckModalVisible(false);
          setCheckResult(null);
          setCheckFormData({
            type: "",
            identifier: "",
          });
        }}
        footer={null}
        width={500}
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Type *
            </label>
            <Select
              placeholder="Select type to check"
              style={{ width: "100%" }}
              value={checkFormData.type}
              onChange={(value) =>
                setCheckFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <Option value={ScammerType.EMAIL}>Email</Option>
              <Option value={ScammerType.PHONE}>Phone</Option>
              <Option value={ScammerType.SOCIAL_MEDIA}>Social Media</Option>
              <Option value={ScammerType.WEBSITE}>Website</Option>
              <Option value={ScammerType.OTHER}>Other</Option>
            </Select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Contact Information *
            </label>
            <Input
              placeholder="Enter email, phone, username, or website to check"
              value={checkFormData.identifier}
              onChange={(e) =>
                setCheckFormData((prev) => ({
                  ...prev,
                  identifier: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: "16px" }}>
            <Space>
              <Button
                onClick={() => {
                  setCheckModalVisible(false);
                  setCheckResult(null);
                  setCheckFormData({
                    type: "",
                    identifier: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => checkScammer(checkFormData)}
              >
                Check Now
              </Button>
            </Space>
          </div>

          {checkResult && (
            <Alert
              message={
                checkResult.isScammer
                  ? "⚠️ Scammer Found!"
                  : "✅ No Scammer Record"
              }
              description={checkResult.message}
              type={checkResult.isScammer ? "error" : "success"}
              showIcon
            />
          )}
        </div>
      </Modal>

      {/* Details Drawer - FIXED: Using correct field names */}
      <Drawer
        title="Scammer Report Details"
        placement="right"
        width={500}
        open={detailsDrawerVisible}
        onClose={() => setDetailsDrawerVisible(false)}
      >
        {selectedReport && (
          <div>
            <Card title="Basic Information" style={{ marginBottom: "16px" }}>
              <List size="small">
                <List.Item>
                  <Text strong>Type:</Text>
                  <Tag icon={getTypeIcon(selectedReport.type)} color="blue">
                    {getTypeDisplayName(selectedReport.type)}
                  </Tag>
                </List.Item>
                <List.Item>
                  <Text strong>Contact Info:</Text>
                  <Text code>{selectedReport.identifier}</Text>
                </List.Item>
                <List.Item>
                  <Text strong>Status:</Text>
                  <Tag color={getStatusColor(selectedReport.status)}>
                    {selectedReport.status?.toUpperCase() || "PENDING"}
                  </Tag>
                </List.Item>
                <List.Item>
                  <Text strong>Report Count:</Text>
                  <Badge count={selectedReport.reportCount || 1} showZero />
                </List.Item>
                <List.Item>
                  <Text strong>Created:</Text>
                  <Text>
                    {new Date(selectedReport.createdAt).toLocaleString()}
                  </Text>
                </List.Item>
                {selectedReport.lastReportedAt && (
                  <List.Item>
                    <Text strong>Last Reported:</Text>
                    <Text>
                      {new Date(selectedReport.lastReportedAt).toLocaleString()}
                    </Text>
                  </List.Item>
                )}
              </List>
            </Card>

            <Card title="Description" style={{ marginBottom: "16px" }}>
              <Text>{selectedReport.description}</Text>
            </Card>

            {selectedReport.additionalInfo && (
              <Card
                title="Additional Information"
                style={{ marginBottom: "16px" }}
              >
                <Text>{selectedReport.additionalInfo}</Text>
              </Card>
            )}

            {selectedReport.evidence && selectedReport.evidence.length > 0 && (
              <Card title="Evidence">
                <List
                  size="small"
                  dataSource={selectedReport.evidence}
                  renderItem={(evidence) => (
                    <List.Item>
                      <Text code>{evidence}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ScammerReportPage;
