import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Alert, Spin, Badge, Typography, Divider } from 'antd';
import {
  UserOutlined,
  ExclamationCircleOutlined,
  SecurityScanOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ModeratorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    users: [],
    scamChecks: [],
    scammerReports: [],
    stats: {
      totalUsers: 0,
      totalScamChecks: 0,
      totalReports: 0,
      recentActivity: 0
    }
  });

  const checkAuthorization = () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const userRole = localStorage.getItem('user_role');
      const accessToken = localStorage.getItem('access_token');
      
      console.log('Checking auth - Role:', userRole, 'Token exists:', !!accessToken); 
      
      if (!userRole || !accessToken) {
        return false;
      }
      
      return userRole === 'moderator';
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  };

  const getAuthHeaders = () => {
    if (typeof window === 'undefined') return {};
    
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();

      const [usersResponse, scamChecksResponse, reportsResponse] = await Promise.allSettled([
        fetch('https://ndimboniapi.ini.rw/users', { headers }),
        fetch('https://ndimboniapi.ini.rw/api/scam-check/all', { headers }),
        fetch('https://ndimboniapi.ini.rw/api/api/scammer-reports/all', { headers })
      ]);

      const users = usersResponse.status === 'fulfilled' && usersResponse.value.ok 
        ? await usersResponse.value.json() 
        : [];
      
      const scamChecks = scamChecksResponse.status === 'fulfilled' && scamChecksResponse.value.ok 
        ? await scamChecksResponse.value.json() 
        : [];
      
      const scammerReports = reportsResponse.status === 'fulfilled' && reportsResponse.value.ok 
        ? await reportsResponse.value.json() 
        : [];

      const stats = {
        totalUsers: Array.isArray(users) ? users.length : 0,
        totalScamChecks: Array.isArray(scamChecks) ? scamChecks.length : 0,
        totalReports: Array.isArray(scammerReports) ? scammerReports.length : 0,
        recentActivity: getRecentActivity(users, scamChecks, scammerReports)
      };

      setDashboardData({
        users: Array.isArray(users) ? users : [],
        scamChecks: Array.isArray(scamChecks) ? scamChecks : [],
        scammerReports: Array.isArray(scammerReports) ? scammerReports : [],
        stats
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivity = (users, scamChecks, reports) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let recentCount = 0;


    if (Array.isArray(scamChecks)) {
      recentCount += scamChecks.filter(check => 
        check.created_at && new Date(check.created_at) > sevenDaysAgo
      ).length;
    }

    if (Array.isArray(reports)) {
      recentCount += reports.filter(report => 
        report.created_at && new Date(report.created_at) > sevenDaysAgo
      ).length;
    }

    return recentCount;
  };

  const getRecentActivities = () => {
    const activities = [];
    const { users, scamChecks, scammerReports } = dashboardData;

    users.slice(0, 3).forEach(user => {
      activities.push({
        key: `user-${user.id}`,
        type: 'User Registration',
        description: `New user: ${user.username || user.email}`,
        time: user.created_at,
        status: 'success',
        icon: <UserOutlined />
      });
    });

    scamChecks.slice(0, 3).forEach(check => {
      activities.push({
        key: `check-${check.id}`,
        type: 'Scam Check',
        description: `Scam check performed`,
        time: check.created_at,
        status: check.is_scam ? 'warning' : 'success',
        icon: <SecurityScanOutlined />
      });
    });

    scammerReports.slice(0, 3).forEach(report => {
      activities.push({
        key: `report-${report.id}`,
        type: 'Scam Report',
        description: `New scam report submitted`,
        time: report.created_at,
        status: 'error',
        icon: <ExclamationCircleOutlined />
      });
    });

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  const activityColumns = [
    {
      title: 'Activity',
      dataIndex: 'type',
      key: 'type',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ marginRight: 8, color: '#1890ff' }}>
            {record.icon}
          </div>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = {
          success: { color: 'green', text: 'Success' },
          warning: { color: 'orange', text: 'Warning' },
          error: { color: 'red', text: 'Alert' }
        };
        return <Badge color={config[status]?.color} text={config[status]?.text} />;
      },
    },
  ];

  useEffect(() => {
 
    setIsClient(true);
    
   
    const timeoutId = setTimeout(() => {
      const authorized = checkAuthorization();
      setIsAuthorized(authorized);
      setAuthChecked(true);
      
      if (authorized) {
        fetchDashboardData();
      } else {
        setLoading(false);
        setError('Unauthorized access. Admin role required.');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  
  if (!isClient || !authChecked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Access Denied"
          description="You don't have permission to access this dashboard. Admin role required."
          type="error"
          showIcon
          action={
            <button 
              onClick={() => {
                const authorized = checkAuthorization();
                setIsAuthorized(authorized);
                if (authorized) {
                  fetchDashboardData();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#1890ff',
                cursor: 'pointer',
                textDecoration: 'underline'
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={fetchDashboardData}
              style={{
                background: 'none',
                border: 'none',
                color: '#1890ff',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Retry
            </button>
          }
        />
      </div>
    );
  }

  const { stats } = dashboardData;

  return (
    <div style={{ padding: '25px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Title level={2} style={{ marginBottom: '24px', color: '#1A5276' }}>
       Moderator Dashboard Overview
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
      
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Scam Checks"
              value={stats.totalScamChecks}
              prefix={<SecurityScanOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Scam Reports"
              value={stats.totalReports}
              prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Recent Activity"
              value={stats.recentActivity}
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              suffix="(7 days)"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity Progress and Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="System Activity" style={{ height: '400px' }}>
      
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Scam Detection Rate</Text>
              <Progress 
                percent={stats.totalScamChecks > 0 ? Math.round((stats.totalReports / stats.totalScamChecks) * 100) : 0}
                strokeColor="#faad14" 
                style={{ marginTop: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Weekly Activity</Text>
              <Progress 
                percent={Math.min((stats.recentActivity / 20) * 100, 100)} 
                strokeColor="#52c41a" 
                style={{ marginTop: '8px' }}
              />
            </div>
            <Divider />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <TrophyOutlined style={{ fontSize: '24px', color: '#faad14' }} />
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                System is running smoothly
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" style={{ height: '400px' }}>
            <Table
              dataSource={getRecentActivities()}
              columns={activityColumns}
              pagination={false}
              size="small"
              style={{ height: '100%' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', backgroundColor: '#e6f7ff', border: '1px solid #91d5ff' }}>
            <CheckCircleOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
            <Title level={4} style={{ color: '#1890ff', margin: 0 }}>Secure</Title>
            <Text type="secondary">System Security Status</Text>
          </Card>
        </Col>
       
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
            <WarningOutlined style={{ fontSize: '32px', color: '#faad14', marginBottom: '8px' }} />
            <Title level={4} style={{ color: '#faad14', margin: 0 }}>Monitoring</Title>
            <Text type="secondary">Active Threat Detection</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ModeratorDashboard;