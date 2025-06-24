import React, { useState, useEffect } from 'react';
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
  Badge
} from 'antd';
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
  BarChartOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;


const API_BASE_URL = 'https://ndimboniapi.ini.rw/api/scam-check';


const CheckStatus = {
  SAFE: 'SAFE',
  SUSPICIOUS: 'SUSPICIOUS',
  MALICIOUS: 'MALICIOUS',
  UNKNOWN: 'UNKNOWN'
};

const IntentType = {
  LEGITIMATE: 'LEGITIMATE',
  PHISHING: 'PHISHING',
  ROMANCE_SCAM: 'ROMANCE_SCAM',
  INVESTMENT_SCAM: 'INVESTMENT_SCAM',
  LOTTERY_SCAM: 'LOTTERY_SCAM',
  MONEY_REQUEST: 'MONEY_REQUEST',
  UNKNOWN: 'UNKNOWN'
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
    total: 0
  });
  const [filters, setFilters] = useState({
    status: null,
    intent: null,
    dateRange: null
  });
  const [messageValue, setMessageValue] = useState('');

 
  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem('access_token');
      const userRole = localStorage.getItem('user_role');
      
      if (!token) {
        throw new Error('No access token found');
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-User-Role': userRole || 'user'
      };
    } catch (error) {
      console.error('Error getting auth headers:', error);
      setAuthError(true);
      return {
        'Content-Type': 'application/json'
      };
    }
  };


  const checkAuthorization = () => {
    try {
      const token = localStorage.getItem('access_token');
      const userRole = localStorage.getItem('user_role');
      
      if (!token) {
        setAuthError(true);
        return false;
      }
      
      setAuthError(false);
      return true;
    } catch (error) {
      console.error('Authorization check failed:', error);
      setAuthError(true);
      return false;
    }
  };

  
  const apiCall = async (endpoint, options = {}) => {
    try {
      if (!checkAuthorization()) {
        throw new Error('Authentication required');
      }

      const url = `${API_BASE_URL}${endpoint}`;
      const headers = getAuthHeaders();
      
      const config = {
        method: 'GET',
        headers,
        ...options
      };

      if (options.body && (config.method === 'POST' || config.method === 'PUT')) {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      
      if (response.status === 401) {
        setAuthError(true);
        throw new Error('Unauthorized access. Please check your credentials.');
      }
      
      if (response.status === 403) {
        throw new Error('Forbidden. You do not have permission to access this resource.');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call failed:', error);
      
      if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
        setAuthError(true);
      }
      
      throw error;
    }
  };


  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      setAuthError(false);
      
      const response = await apiCall('/stats');
      
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
      
      if (!authError) {
        message.error('Failed to fetch statistics: ' + error.message);
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
        params.append('status', appliedFilters.status);
      }
      if (appliedFilters.intent) {
        params.append('intent', appliedFilters.intent);
      }
      if (appliedFilters.dateRange && appliedFilters.dateRange[0]) {
        params.append('fromDate', appliedFilters.dateRange[0].toISOString());
      }
      if (appliedFilters.dateRange && appliedFilters.dateRange[1]) {
        params.append('toDate', appliedFilters.dateRange[1].toISOString());
      }

      const response = await apiCall(`/all?${params.toString()}`);
      
      if (response.success) {
        setChecks(response.data);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.total
        }));
      } else {
        throw new Error(response.message || 'Failed to fetch checks');
      }
    } catch (error) {
      console.error('Checks fetch error:', error);
      
      if (!authError) {
        message.error('Failed to fetch scam checks: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitCheck = async (values) => {
    try {
      const response = await apiCall('/check', {
        method: 'POST',
        body: { message: values.message }
      });
      
      if (response.success && response.data) {
        message.success('Message checked successfully');
        setCheckModalVisible(false);
        setMessageValue('');
        fetchChecks();
        fetchStats();
      } else {
        throw new Error(response.message || 'Failed to check message');
      }
    } catch (error) {
      console.error('Submit check error:', error);
      
      if (!authError) {
        message.error('Failed to check message: ' + error.message);
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
        throw new Error(response.message || 'Failed to fetch check details');
      }
    } catch (error) {
      console.error('Check details fetch error:', error);
      
      if (!authError) {
        message.error('Failed to fetch check details: ' + error.message);
      }
    }
  };

  const deleteCheck = async (id) => {
    try {
      const response = await apiCall(`/check/${id}/delete`, {
        method: 'POST'
      });
      
      if (response.success) {
        message.success('Check deleted successfully');
        fetchChecks();
        fetchStats();
      } else {
        throw new Error(response.message || 'Failed to delete check');
      }
    } catch (error) {
      console.error('Delete check error:', error);
      
      if (!authError) {
        message.error('Failed to delete check: ' + error.message);
      }
    }
  };





  const retryWithAuth = () => {
    const isAuthorized = checkAuthorization();
    if (isAuthorized) {
      fetchStats();
      fetchChecks();
    } else {
      message.error('Please login again to continue');
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      [CheckStatus.SAFE]: 'green',
      [CheckStatus.SUSPICIOUS]: 'orange',
      [CheckStatus.MALICIOUS]: 'red',
      [CheckStatus.UNKNOWN]: 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      [CheckStatus.SAFE]: <CheckCircleOutlined />,
      [CheckStatus.SUSPICIOUS]: <ExclamationCircleOutlined />,
      [CheckStatus.MALICIOUS]: <CloseCircleOutlined />,
      [CheckStatus.UNKNOWN]: <QuestionCircleOutlined />
    };
    return icons[status] || <QuestionCircleOutlined />;
  };

  const getIntentColor = (intent) => {
    const colors = {
      [IntentType.LEGITIMATE]: 'green',
      [IntentType.PHISHING]: 'red',
      [IntentType.ROMANCE_SCAM]: 'magenta',
      [IntentType.INVESTMENT_SCAM]: 'orange',
      [IntentType.LOTTERY_SCAM]: 'purple',
      [IntentType.MONEY_REQUEST]: 'volcano',
      [IntentType.UNKNOWN]: 'gray'
    };
    return colors[intent] || 'gray';
  };


  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      ellipsis: true,
      render: (id) => (
        <Tooltip title={id}>
          <Text code>{id.substring(0, 8)}...</Text>
        </Tooltip>
      )
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (message) => (
        <Tooltip title={message}>
          <Text>{message}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Is Scam',
      dataIndex: ['result', 'isScam'],
      key: 'isScam',
      width: 100,
      render: (isScam) => (
        <Tag color={isScam ? 'red' : 'green'}>
          {isScam ? 'SCAM' : 'SAFE'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: ['result', 'status'],
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status || 'UNKNOWN'}
        </Tag>
      )
    },
    {
      title: 'Confidence',
      dataIndex: ['result', 'confidence'],
      key: 'confidence',
      width: 120,
      render: (confidence) => (
        <Progress 
          percent={Math.round((parseFloat(confidence) || 0) * 100)} 
          size="small"
          strokeColor="#1890ff"
        />
      )
    },
    {
      title: 'Risk Score',
      dataIndex: ['result', 'riskScore'],
      key: 'riskScore',
      width: 120,
      render: (score) => (
        <Progress 
          percent={Math.round((parseFloat(score) || 0) * 100)} 
          size="small"
          strokeColor={score > 0.8 ? 'red' : score > 0.5 ? 'orange' : 'green'}
        />
      )
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      width: 80,
      render: (source) => (
        <Tag color="blue">{source || 'web'}</Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => fetchCheckDetails(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
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
      <div style={{ padding: '24px' }}>
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
    <div style={{ padding: '24px' }}>
      <Title level={2}>Scam Check Management</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
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
              valueStyle={{ color: '#3f8600' }}
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
              valueStyle={{ color: '#fa8c16' }}
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
              valueStyle={{ color: '#cf1322' }}
              loading={statsLoading}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Top Intents */}
      {stats?.topIntents && stats.topIntents.length > 0 && (
        <Card title="Top Detected Intents" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            {stats.topIntents.slice(0, 5).map((item, index) => (
              <Col xs={24} sm={12} md={8} lg={4} key={index}>
                <Card size="small">
                  <Statistic
                    title={item.intent?.replace('_', ' ') || 'UNKNOWN'}
                    value={item.count}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Main Table */}
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={8} md={5}>
            <Select
              placeholder="Filter by Status"
              allowClear
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              {Object.values(CheckStatus).map(status => (
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
              style={{ width: '100%' }}
              value={filters.intent}
              onChange={(value) => setFilters(prev => ({ ...prev, intent: value }))}
            >
              {Object.values(IntentType).map(intent => (
                <Option key={intent} value={intent}>
                  <Tag color={getIntentColor(intent)}>{intent.replace('_', ' ')}</Tag>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              value={filters.dateRange}
              onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
            />
          </Col>
          <Col xs={24} sm={24} md={5} style={{ textAlign: 'right' }}>
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
              setPagination(prev => ({ ...prev, pageSize }));
              fetchChecks(page, filters);
            }
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
          setMessageValue('');
        }}
        footer={null}
        width={600}
      >
        <div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Message to Check
            </label>
            <TextArea
              rows={6}
              placeholder="Enter the message you want to check for scam patterns..."
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCheckModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                onClick={() => {
                  if (!messageValue || messageValue.trim().length < 10) {
                    message.error('Please enter a message of at least 10 characters!');
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

      {/* Details Drawer */}
      <Drawer
        title="Scam Check Details"
        placement="right"
        width={600}
        open={detailsDrawerVisible}
        onClose={() => setDetailsDrawerVisible(false)}
      >
        {selectedCheck && (
          <div>
            <Card title="Basic Information" style={{ marginBottom: '16px' }}>
              <Row gutter={[16, 16]}>
                <Col span={8}><Text strong>ID:</Text></Col>
                <Col span={16}><Text code>{selectedCheck.id}</Text></Col>
                
                <Col span={8}><Text strong>Is Scam:</Text></Col>
                <Col span={16}>
                  <Tag color={selectedCheck.result?.isScam ? 'red' : 'green'}>
                    {selectedCheck.result?.isScam ? 'SCAM' : 'NOT SCAM'}
                  </Tag>
                </Col>
                
                <Col span={8}><Text strong>Status:</Text></Col>
                <Col span={16}>
                  <Tag color={getStatusColor(selectedCheck.result?.status)} icon={getStatusIcon(selectedCheck.result?.status)}>
                    {selectedCheck.result?.status || 'UNKNOWN'}
                  </Tag>
                </Col>
                
                <Col span={8}><Text strong>Risk Score:</Text></Col>
                <Col span={16}>
                  <Progress 
                    percent={Math.round((parseFloat(selectedCheck.result?.riskScore) || 0) * 100)} 
                    size="small"
                    strokeColor={selectedCheck.result?.riskScore > 0.8 ? 'red' : selectedCheck.result?.riskScore > 0.5 ? 'orange' : 'green'}
                  />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {((parseFloat(selectedCheck.result?.riskScore) || 0) * 100).toFixed(1)}%
                  </Text>
                </Col>
                
                <Col span={8}><Text strong>Confidence:</Text></Col>
                <Col span={16}>
                  <Progress 
                    percent={Math.round((parseFloat(selectedCheck.result?.confidence) || 0) * 100)} 
                    size="small"
                    strokeColor="#1890ff"
                  />
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    {((parseFloat(selectedCheck.result?.confidence) || 0) * 100).toFixed(1)}%
                  </Text>
                </Col>
                
                <Col span={8}><Text strong>Source:</Text></Col>
                <Col span={16}>
                  <Tag color="blue">{selectedCheck.source || 'web'}</Tag>
                </Col>
                
                <Col span={8}><Text strong>Created:</Text></Col>
                <Col span={16}>{new Date(selectedCheck.createdAt).toLocaleString()}</Col>
              </Row>
            </Card>

            <Card title="Message Content" style={{ marginBottom: '16px' }}>
              <Paragraph>
                <Text>{selectedCheck.message}</Text>
              </Paragraph>
            </Card>

            {selectedCheck.result?.reasons?.length > 0 && (
              <Card title="Detection Reasons" style={{ marginBottom: '16px' }}>
                <List
                  size="small"
                  dataSource={selectedCheck.result.reasons}
                  renderItem={(reason, index) => (
                    <List.Item>
                      <Text>{reason}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {selectedCheck.result?.detectedPatterns?.length > 0 && (
              <Card title="Detected Patterns" style={{ marginBottom: '16px' }}>
                <Space wrap>
                  {selectedCheck.result.detectedPatterns.map((pattern, index) => (
                    <Tag key={index} color="blue">
                      {pattern}
                    </Tag>
                  ))}
                </Space>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default ScamCheckPage;