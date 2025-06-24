import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Tooltip,
  message,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Typography,
  Popconfirm,
  Drawer,
  List,
  Timeline,
  Badge,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  SendOutlined,
  LinkOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const API_BASE_URL =
  process.env.PUBLIC_API_URL || "https://ndimboni.ini.rw/api/scam-check";

const CheckStatus = {
  SAFE: "SAFE",
  SUSPICIOUS: "SUSPICIOUS",
  MALICIOUS: "MALICIOUS",
  UNKNOWN: "UNKNOWN",
};

const IntentType = {
  LEGITIMATE: "LEGITIMATE",
  PHISHING: "PHISHING",
  ROMANCE_SCAM: "ROMANCE_SCAM",
  INVESTMENT_SCAM: "INVESTMENT_SCAM",
  LOTTERY_SCAM: "LOTTERY_SCAM",
  MONEY_REQUEST: "MONEY_REQUEST",
  UNKNOWN: "UNKNOWN",
};

const ScamCheckPage = () => {
  const [checks, setChecks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [checkModalVisible, setCheckModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: null,
    intent: null,
    dateRange: null,
  });
  const [messageValue, setMessageValue] = useState("");

  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem("access_token");
      const userRole = localStorage.getItem("user_role");

      if (!token) {
        throw new Error("No access token found");
      }

      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User-Role": userRole || "user",
      };
    } catch (error) {
      console.error("Error getting auth headers:", error);
      setAuthError(true);
      return {
        "Content-Type": "application/json",
      };
    }
  };

  const checkAuthorization = () => {
    try {
      const token = localStorage.getItem("access_token");
      const userRole = localStorage.getItem("user_role");

      if (!token) {
        setAuthError(true);
        return false;
      }

      setAuthError(false);
      return true;
    } catch (error) {
      console.error("Authorization check failed:", error);
      setAuthError(true);
      return false;
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    try {
      if (!checkAuthorization()) {
        throw new Error("Authentication required");
      }

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

      const response = await fetch(url, config);

      if (response.status === 401) {
        setAuthError(true);
        throw new Error("Unauthorized access. Please check your credentials.");
      }

      if (response.status === 403) {
        throw new Error(
          "Forbidden. You do not have permission to access this resource."
        );
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API call failed:", error);

      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("Authentication")
      ) {
        setAuthError(true);
      }

      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setAuthError(false);

      const response = await apiCall("/stats");

      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch stats");
      }
    } catch (error) {
      console.error("Stats fetch error:", error);

      if (!authError) {
        message.error("Failed to fetch statistics: " + error.message);
      }
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchChecks = async (page = 1, appliedFilters = {}) => {
    try {
      setLoading(true);
      setAuthError(false);

      const params = new URLSearchParams({
        limit: pagination.pageSize.toString(),
        offset: ((page - 1) * pagination.pageSize).toString(),
      });

      if (appliedFilters.status) {
        params.append("status", appliedFilters.status);
      }
      if (appliedFilters.intent) {
        params.append("intent", appliedFilters.intent);
      }
      if (appliedFilters.dateRange && appliedFilters.dateRange[0]) {
        params.append("fromDate", appliedFilters.dateRange[0].toISOString());
      }
      if (appliedFilters.dateRange && appliedFilters.dateRange[1]) {
        params.append("toDate", appliedFilters.dateRange[1].toISOString());
      }

      const response = await apiCall(`/all?${params.toString()}`);

      if (response.success) {
        setChecks(response.data);
        setPagination((prev) => ({
          ...prev,
          current: page,
          total: response.total,
        }));
      } else {
        throw new Error(response.message || "Failed to fetch checks");
      }
    } catch (error) {
      console.error("Checks fetch error:", error);

      if (!authError) {
        message.error("Failed to fetch scam checks: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitCheck = async (values) => {
    try {
      const response = await apiCall("/check", {
        method: "POST",
        body: { message: values.message },
      });

      if (response.success && response.data) {
        message.success("Message checked successfully");
        setCheckModalVisible(false);
        setMessageValue("");
        fetchChecks();
        fetchStats();
      } else {
        throw new Error(response.message || "Failed to check message");
      }
    } catch (error) {
      console.error("Submit check error:", error);

      if (!authError) {
        message.error("Failed to check message: " + error.message);
      }
    }
  };

  const fetchCheckDetails = async (id) => {
    try {
      const response = await apiCall(`/check/${id}`);

      if (response.success) {
        setSelectedCheck(response.data);
        setDetailsDrawerVisible(true);
      } else {
        throw new Error(response.message || "Failed to fetch check details");
      }
    } catch (error) {
      console.error("Check details fetch error:", error);

      if (!authError) {
        message.error("Failed to fetch check details: " + error.message);
      }
    }
  };

  const deleteCheck = async (id) => {
    try {
      const response = await apiCall(`/check/${id}/delete`, {
        method: "POST",
      });

      if (response.success) {
        message.success("Check deleted successfully");
        fetchChecks();
        fetchStats();
      } else {
        throw new Error(response.message || "Failed to delete check");
      }
    } catch (error) {
      console.error("Delete check error:", error);

      if (!authError) {
        message.error("Failed to delete check: " + error.message);
      }
    }
  };

  const retryWithAuth = () => {
    const isAuthorized = checkAuthorization();
    if (isAuthorized) {
      fetchStats();
      fetchChecks();
    } else {
      message.error("Please login again to continue");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [CheckStatus.SAFE]: "green",
      [CheckStatus.SUSPICIOUS]: "orange",
      [CheckStatus.MALICIOUS]: "red",
      [CheckStatus.UNKNOWN]: "gray",
    };
    return colors[status] || "gray";
  };

  const getStatusIcon = (status) => {
    const icons = {
      [CheckStatus.SAFE]: <CheckCircleOutlined />,
      [CheckStatus.SUSPICIOUS]: <ExclamationCircleOutlined />,
      [CheckStatus.MALICIOUS]: <CloseCircleOutlined />,
      [CheckStatus.UNKNOWN]: <QuestionCircleOutlined />,
    };
    return icons[status] || <QuestionCircleOutlined />;
  };

  const getIntentColor = (intent) => {
    const colors = {
      [IntentType.LEGITIMATE]: "green",
      [IntentType.PHISHING]: "red",
      [IntentType.ROMANCE_SCAM]: "magenta",
      [IntentType.INVESTMENT_SCAM]: "orange",
      [IntentType.LOTTERY_SCAM]: "purple",
      [IntentType.MONEY_REQUEST]: "volcano",
      [IntentType.UNKNOWN]: "gray",
    };
    return colors[intent] || "gray";
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      ellipsis: true,
      render: (id) => (
        <Tooltip title={id}>
          <Text code>{id.substring(0, 6)}...</Text>
        </Tooltip>
      ),
    },
    {
      title: "Message",
      dataIndex: ["result", "scanResults", "message"],
      key: "message",
      ellipsis: true,
      width: 200,
      render: (message) => (
        <Tooltip title={message}>
          <Text>{message}</Text>
        </Tooltip>
      ),
    },
    {
      title: "User",
      dataIndex: ["result", "metadata", "user", "name"],
      key: "userName",
      width: 120,
      ellipsis: true,
      render: (name, record) => {
        const user = record?.result?.metadata?.user;
        if (!user) return <Text type="secondary">Anonymous</Text>;
        return (
          <Tooltip title={`${user.name} (${user.email})`}>
            <Text>{user.name}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Is Scam",
      dataIndex: ["result", "isScam"],
      key: "isScam",
      width: 80,
      render: (isScam) => (
        <Tag color={isScam ? "red" : "green"}>{isScam ? "SCAM" : "SAFE"}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: ["result", "status"],
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status || "UNKNOWN"}
        </Tag>
      ),
    },
    {
      title: "Intent",
      dataIndex: ["result", "detectedIntent"],
      key: "detectedIntent",
      width: 120,
      render: (intent) => (
        <Tag color={getIntentColor(intent)}>
          {intent ? intent.replace('_', ' ') : "UNKNOWN"}
        </Tag>
      ),
    },
    {
      title: "Confidence",
      dataIndex: ["result", "confidence"],
      key: "confidence",
      width: 100,
      render: (confidence) => (
        <Progress
          percent={Math.round((parseFloat(confidence) || 0) * 100)}
          size="small"
          strokeColor="#1890ff"
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: "Risk Score",
      dataIndex: ["result", "riskScore"],
      key: "riskScore",
      width: 100,
      render: (score) => (
        <Progress
          percent={Math.round((parseFloat(score) || 0) * 100)}
          size="small"
          strokeColor={score > 0.8 ? "red" : score > 0.5 ? "orange" : "green"}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 70,
      render: (source) => <Tag color="blue">{source || "web"}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => fetchCheckDetails(record.id)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Are you sure you want to delete this check?"
              onConfirm={() => deleteCheck(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const isAuthorized = checkAuthorization();

    if (isAuthorized) {
      fetchStats();
      fetchChecks();
    }
  }, []);

  if (authError) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Authentication Required"
          description="You need to be logged in to access this page. Please check your authentication credentials."
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={retryWithAuth}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Scam Check Management</Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Checks"
              value={stats?.totalChecks || 0}
              loading={statsLoading}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Safe Messages"
              value={stats?.safeChecks || 0}
              valueStyle={{ color: "#3f8600" }}
              loading={statsLoading}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Suspicious"
              value={stats?.suspiciousChecks || 0}
              valueStyle={{ color: "#fa8c16" }}
              loading={statsLoading}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Malicious"
              value={stats?.maliciousChecks || 0}
              valueStyle={{ color: "#cf1322" }}
              loading={statsLoading}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Intents */}
      {stats?.topIntents && stats.topIntents.length > 0 && (
        <Card title="Top Detected Intents" style={{ marginBottom: "24px" }}>
          <Row gutter={[16, 16]}>
            {stats.topIntents.slice(0, 5).map((item, index) => (
              <Col xs={24} sm={12} md={8} lg={4} key={index}>
                <Card size="small">
                  <Statistic
                    title={item.intent?.replace("_", " ") || "UNKNOWN"}
                    value={item.count}
                    valueStyle={{ fontSize: "16px" }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: "100%" }}
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
            >
              {Object.values(CheckStatus).map((status) => (
                <Option key={status} value={status}>
                  <Tag color={getStatusColor(status)}>{status}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Filter by Intent"
              allowClear
              style={{ width: "100%" }}
              value={filters.intent}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, intent: value }))
              }
            >
              {Object.values(IntentType).map((intent) => (
                <Option key={intent} value={intent}>
                  <Tag color={getIntentColor(intent)}>
                    {intent.replace("_", " ")}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              style={{ width: "100%" }}
              value={filters.dateRange}
              onChange={(dates) =>
                setFilters((prev) => ({ ...prev, dateRange: dates }))
              }
            />
          </Col>
          <Col xs={24} sm={24} md={5} style={{ textAlign: "right" }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchChecks()}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setCheckModalVisible(true)}
              >
                Check Message
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={checks}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} checks`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, pageSize }));
              fetchChecks(page, filters);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* New Check Modal */}
      <Modal
        title="Check New Message"
        open={checkModalVisible}
        onCancel={() => {
          setCheckModalVisible(false);
          setMessageValue("");
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
              Message to Check
            </label>
            <TextArea
              rows={6}
              placeholder="Enter the message you want to check for scam patterns..."
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => setCheckModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  if (!messageValue || messageValue.trim().length < 10) {
                    message.error(
                      "Please enter a message of at least 10 characters!"
                    );
                    return;
                  }
                  submitCheck({ message: messageValue.trim() });
                }}
              >
                Check Message
              </Button>
            </Space>
          </div>
        </div>
      </Modal>

      {/* Details Drawer - Enhanced with Comprehensive Scan Results */}
      <Drawer
        title="Comprehensive Scam Check Details"
        placement="right"
        width={800}
        open={detailsDrawerVisible}
        onClose={() => setDetailsDrawerVisible(false)}
      >
        {selectedCheck && (
          <div style={{ maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
            <Card title="Basic Information" style={{ marginBottom: "16px" }}>
              <Row gutter={[16, 16]}>
                <Col span={8}>
                  <Text strong>ID:</Text>
                </Col>
                <Col span={16}>
                  <Text code>{selectedCheck.id}</Text>
                </Col>

                <Col span={8}>
                  <Text strong>Is Scam:</Text>
                </Col>
                <Col span={16}>
                  <Tag color={selectedCheck.result?.isScam ? "red" : "green"}>
                    {selectedCheck.result?.isScam ? "SCAM" : "NOT SCAM"}
                  </Tag>
                </Col>

                <Col span={8}>
                  <Text strong>Status:</Text>
                </Col>
                <Col span={16}>
                  <Tag
                    color={getStatusColor(selectedCheck.result?.status)}
                    icon={getStatusIcon(selectedCheck.result?.status)}
                  >
                    {selectedCheck.result?.status || "UNKNOWN"}
                  </Tag>
                </Col>

                <Col span={8}>
                  <Text strong>Risk Score:</Text>
                </Col>
                <Col span={16}>
                  <Progress
                    percent={Math.round(
                      (parseFloat(selectedCheck.result?.riskScore) || 0) * 100
                    )}
                    size="small"
                    strokeColor={
                      selectedCheck.result?.riskScore > 0.8
                        ? "red"
                        : selectedCheck.result?.riskScore > 0.5
                        ? "orange"
                        : "green"
                    }
                  />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {(
                      (parseFloat(selectedCheck.result?.riskScore) || 0) * 100
                    ).toFixed(1)}
                    %
                  </Text>
                </Col>

                <Col span={8}>
                  <Text strong>Confidence:</Text>
                </Col>
                <Col span={16}>
                  <Progress
                    percent={Math.round(
                      (parseFloat(selectedCheck.result?.confidence) || 0) * 100
                    )}
                    size="small"
                    strokeColor="#1890ff"
                  />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {(
                      (parseFloat(selectedCheck.result?.confidence) || 0) * 100
                    ).toFixed(1)}
                    %
                  </Text>
                </Col>

                <Col span={8}>
                  <Text strong>Source:</Text>
                </Col>
                <Col span={16}>
                  <Tag color="blue">{selectedCheck.source || "web"}</Tag>
                </Col>

                <Col span={8}>
                  <Text strong>Created:</Text>
                </Col>
                <Col span={16}>
                  {new Date(selectedCheck.createdAt).toLocaleString()}
                </Col>
              </Row>
            </Card>

            <Card title="Message Content" style={{ marginBottom: "16px" }}>
              <Paragraph>
                <Text>
                  {selectedCheck.result?.scanResults?.message ||
                    selectedCheck.message}
                </Text>
              </Paragraph>
            </Card>

            {/* Extracted Identifiers */}
            {selectedCheck.result?.scanResults?.extractedIdentifiers && (
              <Card
                title="Extracted Information"
                style={{ marginBottom: "16px" }}
              >
                <Row gutter={[16, 16]}>
                  {selectedCheck.result.scanResults.extractedIdentifiers
                    .phoneNumbers?.length > 0 && (
                    <Col span={24}>
                      <Text strong>
                        Phone Numbers (
                        {
                          selectedCheck.result.scanResults.extractedIdentifiers
                            .phoneNumbers.length
                        }
                        ):
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedCheck.result.scanResults.extractedIdentifiers.phoneNumbers.map(
                          (phone, index) => (
                            <Tag key={index} color="blue" style={{ margin: 2 }}>
                              {phone}
                            </Tag>
                          )
                        )}
                      </div>
                    </Col>
                  )}

                  {selectedCheck.result.scanResults.extractedIdentifiers.emails
                    ?.length > 0 && (
                    <Col span={24}>
                      <Text strong>
                        Email Addresses (
                        {
                          selectedCheck.result.scanResults.extractedIdentifiers
                            .emails.length
                        }
                        ):
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedCheck.result.scanResults.extractedIdentifiers.emails.map(
                          (email, index) => (
                            <Tag
                              key={index}
                              color="green"
                              style={{ margin: 2 }}
                            >
                              {email}
                            </Tag>
                          )
                        )}
                      </div>
                    </Col>
                  )}

                  {selectedCheck.result.scanResults.extractedIdentifiers.urls
                    ?.length > 0 && (
                    <Col span={24}>
                      <Text strong>
                        URLs (
                        {
                          selectedCheck.result.scanResults.extractedIdentifiers
                            .urls.length
                        }
                        ):
                      </Text>
                      <div
                        style={{
                          marginTop: 8,
                          maxHeight: 100,
                          overflowY: "auto",
                        }}
                      >
                        {selectedCheck.result.scanResults.extractedIdentifiers.urls.map(
                          (url, index) => (
                            <div key={index} style={{ margin: "4px 0" }}>
                              <Text
                                code
                                style={{
                                  fontSize: "12px",
                                  wordBreak: "break-all",
                                }}
                              >
                                {url}
                              </Text>
                            </div>
                          )
                        )}
                      </div>
                    </Col>
                  )}

                  {selectedCheck.result.scanResults.extractedIdentifiers
                    .cryptoAddresses?.length > 0 && (
                    <Col span={24}>
                      <Text strong>
                        Crypto Addresses (
                        {
                          selectedCheck.result.scanResults.extractedIdentifiers
                            .cryptoAddresses.length
                        }
                        ):
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedCheck.result.scanResults.extractedIdentifiers.cryptoAddresses.map(
                          (address, index) => (
                            <Text
                              key={index}
                              code
                              style={{
                                display: "block",
                                fontSize: "12px",
                                margin: "4px 0",
                                wordBreak: "break-all",
                              }}
                            >
                              {address}
                            </Text>
                          )
                        )}
                      </div>
                    </Col>
                  )}

                  {selectedCheck.result.scanResults.extractedIdentifiers
                    .socialMediaHandles?.length > 0 && (
                    <Col span={24}>
                      <Text strong>
                        Social Media Handles (
                        {
                          selectedCheck.result.scanResults.extractedIdentifiers
                            .socialMediaHandles.length
                        }
                        ):
                      </Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedCheck.result.scanResults.extractedIdentifiers.socialMediaHandles.map(
                          (handle, index) => (
                            <Tag
                              key={index}
                              color="purple"
                              style={{ margin: 2 }}
                            >
                              {handle}
                            </Tag>
                          )
                        )}
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* AI Analysis */}
            {selectedCheck.result?.scanResults?.aiAnalysis && (
              <Card title="AI Analysis" style={{ marginBottom: "16px" }}>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Final Score:</Text>
                    <div>
                      <Progress
                        percent={Math.round(
                          (selectedCheck.result.scanResults.aiAnalysis
                            .finalScore || 0) * 100
                        )}
                        size="small"
                        strokeColor="#722ed1"
                      />
                      <Text type="secondary">
                        {(
                          (selectedCheck.result.scanResults.aiAnalysis
                            .finalScore || 0) * 100
                        ).toFixed(1)}
                        %
                      </Text>
                    </div>
                  </Col>

                  {selectedCheck.result.scanResults.aiAnalysis.intentScore && (
                    <Col span={12}>
                      <Text strong>Intent Score:</Text>
                      <div>
                        <Progress
                          percent={Math.round(
                            (selectedCheck.result.scanResults.aiAnalysis
                              .intentScore.score || 0) * 100
                          )}
                          size="small"
                          strokeColor="#13c2c2"
                        />
                        <Text type="secondary">
                          {(
                            (selectedCheck.result.scanResults.aiAnalysis
                              .intentScore.score || 0) * 100
                          ).toFixed(1)}
                          %
                        </Text>
                      </div>
                    </Col>
                  )}

                  {selectedCheck.result.scanResults.aiAnalysis.recommendations
                    ?.length > 0 && (
                    <Col span={24}>
                      <Text strong>AI Recommendations:</Text>
                      <List
                        size="small"
                        dataSource={
                          selectedCheck.result.scanResults.aiAnalysis
                            .recommendations
                        }
                        renderItem={(rec, index) => (
                          <List.Item style={{ padding: "4px 0" }}>
                            <CheckCircleOutlined
                              style={{ color: "#52c41a", marginRight: 8 }}
                            />
                            <Text style={{ fontSize: "12px" }}>{rec}</Text>
                          </List.Item>
                        )}
                      />
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* Database Matches */}
            {selectedCheck.result?.scanResults?.databaseMatches && (
              <Card
                title="Scammer Database Matches"
                style={{ marginBottom: "16px" }}
              >
                {selectedCheck.result.scanResults.databaseMatches
                  .scammerDbMatches?.length > 0 ? (
                  <Alert
                    message="Matches Found in Scammer Database"
                    description={`${selectedCheck.result.scanResults.databaseMatches.scammerDbMatches.length} matches found`}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                ) : (
                  <Alert
                    message="No Matches Found"
                    description="No matches found in our scammer database"
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                {(selectedCheck.result.scanResults.databaseMatches.phoneMatches
                  ?.length > 0 ||
                  selectedCheck.result.scanResults.databaseMatches.emailMatches
                    ?.length > 0 ||
                  selectedCheck.result.scanResults.databaseMatches.urlMatches
                    ?.length > 0) && (
                  <Row gutter={[16, 16]}>
                    {selectedCheck.result.scanResults.databaseMatches
                      .phoneMatches?.length > 0 && (
                      <Col span={24}>
                        <Text strong style={{ color: "#ff4d4f" }}>
                          Phone Number Matches:
                        </Text>
                        <List
                          size="small"
                          dataSource={
                            selectedCheck.result.scanResults.databaseMatches
                              .phoneMatches
                          }
                          renderItem={(match, index) => (
                            <List.Item style={{ padding: "4px 0" }}>
                              <Text code>{match.identifier}</Text>
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                - {match.description || "Known scammer"}
                              </Text>
                            </List.Item>
                          )}
                        />
                      </Col>
                    )}

                    {selectedCheck.result.scanResults.databaseMatches
                      .emailMatches?.length > 0 && (
                      <Col span={24}>
                        <Text strong style={{ color: "#ff4d4f" }}>
                          Email Matches:
                        </Text>
                        <List
                          size="small"
                          dataSource={
                            selectedCheck.result.scanResults.databaseMatches
                              .emailMatches
                          }
                          renderItem={(match, index) => (
                            <List.Item style={{ padding: "4px 0" }}>
                              <Text code>{match.identifier}</Text>
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                - {match.description || "Known scammer"}
                              </Text>
                            </List.Item>
                          )}
                        />
                      </Col>
                    )}

                    {selectedCheck.result.scanResults.databaseMatches.urlMatches
                      ?.length > 0 && (
                      <Col span={24}>
                        <Text strong style={{ color: "#ff4d4f" }}>
                          URL Matches:
                        </Text>
                        <List
                          size="small"
                          dataSource={
                            selectedCheck.result.scanResults.databaseMatches
                              .urlMatches
                          }
                          renderItem={(match, index) => (
                            <List.Item style={{ padding: "4px 0" }}>
                              <Text code style={{ wordBreak: "break-all" }}>
                                {match.identifier.length > 50
                                  ? match.identifier.substring(0, 50) + "..."
                                  : match.identifier}
                              </Text>
                              <Text type="secondary" style={{ marginLeft: 8 }}>
                                - {match.description || "Known malicious URL"}
                              </Text>
                            </List.Item>
                          )}
                        />
                      </Col>
                    )}
                  </Row>
                )}
              </Card>
            )}

            {/* URL Security Analysis */}
            {(selectedCheck.result?.scanResults?.virusTotalResults ||
              selectedCheck.result?.scanResults?.urlScanResults) && (
              <Card
                title="URL Security Analysis"
                style={{ marginBottom: "16px" }}
              >
                {selectedCheck.result.scanResults.virusTotalResults && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>VirusTotal Results:</Text>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      <Col span={6}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            backgroundColor: "#f6ffed",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ color: "#52c41a", fontWeight: "bold" }}>
                            {selectedCheck.result.scanResults.virusTotalResults
                              .safeUrls || 0}
                          </div>
                          <div style={{ fontSize: 12 }}>Safe</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            backgroundColor: "#fffbe6",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ color: "#faad14", fontWeight: "bold" }}>
                            {selectedCheck.result.scanResults.virusTotalResults
                              .suspiciousUrls || 0}
                          </div>
                          <div style={{ fontSize: 12 }}>Suspicious</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            backgroundColor: "#fff2f0",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                            {selectedCheck.result.scanResults.virusTotalResults
                              .maliciousUrls || 0}
                          </div>
                          <div style={{ fontSize: 12 }}>Malicious</div>
                        </div>
                      </Col>
                      <Col span={6}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            backgroundColor: "#f6f6f6",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ color: "#666", fontWeight: "bold" }}>
                            {selectedCheck.result.scanResults.virusTotalResults
                              .totalUrls || 0}
                          </div>
                          <div style={{ fontSize: 12 }}>Total</div>
                        </div>
                      </Col>
                    </Row>

                    {selectedCheck.result.scanResults.virusTotalResults.details
                      ?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Text strong>URL Details:</Text>
                        <List
                          size="small"
                          dataSource={
                            selectedCheck.result.scanResults.virusTotalResults
                              .details
                          }
                          renderItem={(detail, index) => (
                            <List.Item style={{ padding: "4px 0" }}>
                              <Text
                                code
                                style={{ fontSize: 12, wordBreak: "break-all" }}
                              >
                                {detail.url?.length > 60
                                  ? detail.url.substring(0, 60) + "..."
                                  : detail.url}
                              </Text>
                              <Tag
                                color={detail.isSafe ? "green" : "red"}
                                style={{ marginLeft: 8 }}
                              >
                                {detail.isSafe ? "Safe" : "Threat Detected"}
                              </Tag>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}

                {selectedCheck.result.scanResults.urlScanResults && (
                  <div>
                    <Text strong>Additional URL Scan Results:</Text>
                    <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                      <Col span={8}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            backgroundColor: "#f6ffed",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ color: "#52c41a", fontWeight: "bold" }}>
                            {selectedCheck.result.scanResults.urlScanResults
                              .safeUrls || 0}
                          </div>
                          <div style={{ fontSize: 12 }}>Safe</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            backgroundColor: "#fffbe6",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ color: "#faad14", fontWeight: "bold" }}>
                            {selectedCheck.result.scanResults.urlScanResults
                              .suspiciousUrls || 0}
                          </div>
                          <div style={{ fontSize: 12 }}>Suspicious</div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div
                          style={{
                            textAlign: "center",
                            padding: 8,
                            backgroundColor: "#fff2f0",
                            borderRadius: 4,
                          }}
                        >
                          <div style={{ color: "#ff4d4f", fontWeight: "bold" }}>
                            {selectedCheck.result.scanResults.urlScanResults
                              .maliciousUrls || 0}
                          </div>
                          <div style={{ fontSize: 12 }}>Malicious</div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
              </Card>
            )}

            {/* Intent Analysis */}
            {selectedCheck.result?.scanResults?.intentAnalysis && (
              <Card title="Intent Analysis" style={{ marginBottom: "16px" }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Text strong>Detected Intent: </Text>
                    <Tag color="blue">
                      {selectedCheck.result.scanResults.intentAnalysis.detectedIntent?.replace(
                        "_",
                        " "
                      ) || "Unknown"}
                    </Tag>
                  </Col>

                  {selectedCheck.result.scanResults.intentAnalysis
                    .confidence !== undefined && (
                    <Col span={24}>
                      <Text strong>Confidence:</Text>
                      <Progress
                        percent={Math.round(
                          (selectedCheck.result.scanResults.intentAnalysis
                            .confidence || 0) * 100
                        )}
                        size="small"
                        strokeColor="#1890ff"
                        style={{ marginTop: 4 }}
                      />
                      <Text type="secondary">
                        {(
                          (selectedCheck.result.scanResults.intentAnalysis
                            .confidence || 0) * 100
                        ).toFixed(1)}
                        % confident
                      </Text>
                    </Col>
                  )}

                  {selectedCheck.result.scanResults.intentAnalysis
                    .alternativeIntents?.length > 0 && (
                    <Col span={24}>
                      <Text strong>Alternative Intents:</Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedCheck.result.scanResults.intentAnalysis.alternativeIntents.map(
                          (intent, index) => (
                            <Tag
                              key={index}
                              color="geekblue"
                              style={{ margin: 2 }}
                            >
                              {intent.replace("_", " ")}
                            </Tag>
                          )
                        )}
                      </div>
                    </Col>
                  )}

                  {selectedCheck.result.scanResults.intentAnalysis
                    .linguisticPatterns?.length > 0 && (
                    <Col span={24}>
                      <Text strong>Linguistic Patterns:</Text>
                      <div style={{ marginTop: 8 }}>
                        {selectedCheck.result.scanResults.intentAnalysis.linguisticPatterns.map(
                          (pattern, index) => (
                            <Tag
                              key={index}
                              color="purple"
                              style={{ margin: 2 }}
                            >
                              {pattern.replace("_", " ")}
                            </Tag>
                          )
                        )}
                      </div>
                    </Col>
                  )}
                </Row>
              </Card>
            )}

            {/* Detection Details */}
            {(selectedCheck.result?.reasons?.length > 0 ||
              selectedCheck.result?.detectedPatterns?.length > 0) && (
              <Card title="Detection Details" style={{ marginBottom: "16px" }}>
                {selectedCheck.result.reasons?.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Detection Reasons:</Text>
                    <List
                      size="small"
                      dataSource={selectedCheck.result.reasons}
                      renderItem={(reason, index) => (
                        <List.Item style={{ padding: "4px 0" }}>
                          <ExclamationCircleOutlined
                            style={{ color: "#faad14", marginRight: 8 }}
                          />
                          <Text style={{ fontSize: "12px" }}>{reason}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                )}

                {selectedCheck.result.detectedPatterns?.length > 0 && (
                  <div>
                    <Text strong>Detected Patterns:</Text>
                    <div style={{ marginTop: 8 }}>
                      {selectedCheck.result.detectedPatterns.map(
                        (pattern, index) => (
                          <Tag key={index} color="blue" style={{ margin: 2 }}>
                            {pattern.replace("_", " ")}
                          </Tag>
                        )
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Metadata */}
            {selectedCheck.result?.metadata && (
              <Card
                title="Technical Information"
                style={{ marginBottom: "16px" }}
              >
                <Row gutter={[16, 8]}>
                  {selectedCheck.result.metadata.ipAddress && (
                    <>
                      <Col span={8}>
                        <Text strong>IP Address:</Text>
                      </Col>
                      <Col span={16}>
                        <Text code>
                          {selectedCheck.result.metadata.ipAddress}
                        </Text>
                      </Col>
                    </>
                  )}

                  {selectedCheck.result.metadata.userAgent && (
                    <>
                      <Col span={8}>
                        <Text strong>User Agent:</Text>
                      </Col>
                      <Col span={16}>
                        <Text
                          code
                          style={{ fontSize: 11, wordBreak: "break-all" }}
                        >
                          {selectedCheck.result.metadata.userAgent.length > 100
                            ? selectedCheck.result.metadata.userAgent.substring(
                                0,
                                100
                              ) + "..."
                            : selectedCheck.result.metadata.userAgent}
                        </Text>
                      </Col>
                    </>
                  )}

                  <Col span={8}>
                    <Text strong>Analysis Method:</Text>
                  </Col>
                  <Col span={16}>
                    <Tag color="cyan">
                      {selectedCheck.result.analysisMethod || "standard"}
                    </Tag>
                  </Col>

                  <Col span={8}>
                    <Text strong>Updated:</Text>
                  </Col>
                  <Col span={16}>
                    <Text type="secondary">
                      {new Date(
                        selectedCheck.result.metadata.updatedAt ||
                          selectedCheck.updatedAt
                      ).toLocaleString()}
                    </Text>
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ScamCheckPage;
