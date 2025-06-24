import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Alert,
  Spin,
  Badge,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  ExclamationCircleOutlined,
  SecurityScanOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AdminDashboard = () => {
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
      recentActivity: 0,
    },
  });

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

      return userRole === "admin";
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      console.log("Fetching data with headers:", headers);

      const [usersResponse, scamChecksResponse, reportsResponse] =
        await Promise.allSettled([
          fetch("https://ndimboniapi.ini.rw/users", { headers }),
          fetch("https://ndimboniapi.ini.rw/api/scam-check/all", { headers }),
          fetch("https://ndimboniapi.ini.rw/api/scammer-reports/all", {
            headers,
          }),
        ]);

      let users = [];
      if (usersResponse.status === "fulfilled" && usersResponse.value.ok) {
        const usersData = await usersResponse.value.json();
        console.log("Users response:", usersData);

        if (Array.isArray(usersData)) {
          users = usersData;
        } else if (usersData && Array.isArray(usersData.data)) {
          users = usersData.data;
        } else if (usersData && Array.isArray(usersData.users)) {
          users = usersData.users;
        } else if (usersData && typeof usersData === "object") {
          users = Object.values(usersData).filter(
            (item) => item && typeof item === "object"
          );
        }
      } else {
        console.error(
          "Users fetch failed:",
          usersResponse.status === "fulfilled"
            ? usersResponse.value.status
            : usersResponse.reason
        );
      }

      let scamChecks = [];
      if (
        scamChecksResponse.status === "fulfilled" &&
        scamChecksResponse.value.ok
      ) {
        const scamChecksData = await scamChecksResponse.value.json();
        console.log("Scam checks response:", scamChecksData);

        if (Array.isArray(scamChecksData)) {
          scamChecks = scamChecksData;
        } else if (scamChecksData && Array.isArray(scamChecksData.data)) {
          scamChecks = scamChecksData.data;
        } else if (scamChecksData && Array.isArray(scamChecksData.scamChecks)) {
          scamChecks = scamChecksData.scamChecks;
        } else if (scamChecksData && typeof scamChecksData === "object") {
          scamChecks = Object.values(scamChecksData).filter(
            (item) => item && typeof item === "object"
          );
        }
      } else {
        console.error(
          "Scam checks fetch failed:",
          scamChecksResponse.status === "fulfilled"
            ? scamChecksResponse.value.status
            : scamChecksResponse.reason
        );
      }

      let scammerReports = [];
      if (reportsResponse.status === "fulfilled" && reportsResponse.value.ok) {
        const reportsData = await reportsResponse.value.json();
        console.log("Reports response:", reportsData);

        if (Array.isArray(reportsData)) {
          scammerReports = reportsData;
        } else if (reportsData && Array.isArray(reportsData.data)) {
          scammerReports = reportsData.data;
        } else if (reportsData && Array.isArray(reportsData.reports)) {
          scammerReports = reportsData.reports;
        } else if (reportsData && typeof reportsData === "object") {
          scammerReports = Object.values(reportsData).filter(
            (item) => item && typeof item === "object"
          );
        }
      } else {
        console.error(
          "Reports fetch failed:",
          reportsResponse.status === "fulfilled"
            ? reportsResponse.value.status
            : reportsResponse.reason
        );
      }

      const totalUsers = users.length;
      const totalScamChecks = scamChecks.length;
      const totalReports = scammerReports.length;
      const recentActivity = getRecentActivity(
        users,
        scamChecks,
        scammerReports
      );

      console.log("Calculated stats:", {
        totalUsers,
        totalScamChecks,
        totalReports,
        recentActivity,
      });

      const stats = {
        totalUsers,
        totalScamChecks,
        totalReports,
        recentActivity,
      };

      setDashboardData({
        users,
        scamChecks,
        scammerReports,
        stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(`Failed to load dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getRecentActivity = (users, scamChecks, reports) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let recentCount = 0;

    if (Array.isArray(users)) {
      const recentUsers = users.filter((user) => {
        if (!user) return false;
        const createdAt =
          user.created_at || user.createdAt || user.date_created;
        if (!createdAt) return false;

        try {
          const userDate = new Date(createdAt);
          return userDate > sevenDaysAgo;
        } catch (e) {
          return false;
        }
      });
      recentCount += recentUsers.length;
      console.log(`Recent users: ${recentUsers.length}`);
    }

    if (Array.isArray(scamChecks)) {
      const recentChecks = scamChecks.filter((check) => {
        if (!check) return false;
        const createdAt =
          check.created_at || check.createdAt || check.date_created;
        if (!createdAt) return false;

        try {
          const checkDate = new Date(createdAt);
          return checkDate > sevenDaysAgo;
        } catch (e) {
          return false;
        }
      });
      recentCount += recentChecks.length;
      console.log(`Recent scam checks: ${recentChecks.length}`);
    }

    if (Array.isArray(reports)) {
      const recentReports = reports.filter((report) => {
        if (!report) return false;
        const createdAt =
          report.created_at || report.createdAt || report.date_created;
        if (!createdAt) return false;

        try {
          const reportDate = new Date(createdAt);
          return reportDate > sevenDaysAgo;
        } catch (e) {
          return false;
        }
      });
      recentCount += recentReports.length;
      console.log(`Recent reports: ${recentReports.length}`);
    }

    console.log(`Total recent activity: ${recentCount}`);
    return recentCount;
  };

  const getRecentActivities = () => {
    const activities = [];
    const { users, scamChecks, scammerReports } = dashboardData;

    if (Array.isArray(users) && users.length > 0) {
      const sortedUsers = users
        .filter(
          (user) =>
            user && (user.created_at || user.createdAt || user.date_created)
        )
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || a.date_created);
          const dateB = new Date(b.created_at || b.createdAt || b.date_created);
          return dateB - dateA;
        })
        .slice(0, 3);

      sortedUsers.forEach((user, index) => {
        activities.push({
          key: `user-${user.id || index}`,
          type: "User Registration",
          description: `New user: ${
            user.username || user.email || user.name || "Unknown"
          }`,
          time: user.created_at || user.createdAt || user.date_created,
          status: "success",
          icon: <UserOutlined />,
        });
      });
    }

    if (Array.isArray(scamChecks) && scamChecks.length > 0) {
      const sortedChecks = scamChecks
        .filter(
          (check) =>
            check && (check.created_at || check.createdAt || check.date_created)
        )
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || a.date_created);
          const dateB = new Date(b.created_at || b.createdAt || b.date_created);
          return dateB - dateA;
        })
        .slice(0, 3);

      sortedChecks.forEach((check, index) => {
        activities.push({
          key: `check-${check.id || index}`,
          type: "Scam Check",
          description: `Scam check performed`,
          time: check.created_at || check.createdAt || check.date_created,
          status: check.is_scam || check.isScam ? "warning" : "success",
          icon: <SecurityScanOutlined />,
        });
      });
    }

    if (Array.isArray(scammerReports) && scammerReports.length > 0) {
      const sortedReports = scammerReports
        .filter(
          (report) =>
            report &&
            (report.created_at || report.createdAt || report.date_created)
        )
        .sort((a, b) => {
          const dateA = new Date(a.created_at || a.createdAt || a.date_created);
          const dateB = new Date(b.created_at || b.createdAt || b.date_created);
          return dateB - dateA;
        })
        .slice(0, 3);

      sortedReports.forEach((report, index) => {
        activities.push({
          key: `report-${report.id || index}`,
          type: "Scam Report",
          description: `New scam report submitted`,
          time: report.created_at || report.createdAt || report.date_created,
          status: "error",
          icon: <ExclamationCircleOutlined />,
        });
      });
    }

    return activities
      .sort((a, b) => {
        try {
          const dateA = new Date(a.time);
          const dateB = new Date(b.time);
          return dateB - dateA;
        } catch (e) {
          return 0;
        }
      })
      .slice(0, 4);
  };

  const activityColumns = [
    {
      title: "Activity",
      dataIndex: "type",
      key: "type",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: 8, color: "#1890ff" }}>{record.icon}</div>
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          success: { color: "green", text: "Success" },
          warning: { color: "orange", text: "Warning" },
          error: { color: "red", text: "Alert" },
        };
        return (
          <Badge color={config[status]?.color} text={config[status]?.text} />
        );
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
        setError("Unauthorized access. Admin role required.");
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

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
      <div style={{ padding: "24px" }}>
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
      <div style={{ padding: "24px" }}>
        <Alert
          message="Error Loading Dashboard"
          description={error}
          type="error"
          showIcon
          action={
            <button
              onClick={fetchDashboardData}
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

  const { stats } = dashboardData;

  return (
    <div
      style={{
        padding: "25px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
      }}
    >
      <Title level={2} style={{ marginBottom: "24px", color: "#1A5276" }}>
        Dashboard Overview
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Scam Checks"
              value={stats.totalScamChecks}
              prefix={<SecurityScanOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Scam Reports"
              value={stats.totalReports}
              prefix={
                <ExclamationCircleOutlined style={{ color: "#faad14" }} />
              }
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Recent Activity"
              value={stats.recentActivity}
              prefix={<ClockCircleOutlined style={{ color: "#722ed1" }} />}
              suffix="(7 days)"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Activity Progress and Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <Card title="System Activity" style={{ height: "400px" }}>
            <div style={{ marginBottom: "16px" }}>
              <Text strong>User Growth</Text>
              <Progress
                percent={Math.min((stats.totalUsers / 100) * 100, 100)}
                strokeColor="#1890ff"
                style={{ marginTop: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong>Scam Detection Rate</Text>
              <Progress
                percent={
                  stats.totalScamChecks > 0
                    ? Math.round(
                        (stats.totalReports / stats.totalScamChecks) * 100
                      )
                    : 0
                }
                strokeColor="#faad14"
                style={{ marginTop: "8px" }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong>Weekly Activity</Text>
              <Progress
                percent={Math.min((stats.recentActivity / 20) * 100, 100)}
                strokeColor="#52c41a"
                style={{ marginTop: "8px" }}
              />
            </div>
            <Divider />
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <TrophyOutlined style={{ fontSize: "24px", color: "#faad14" }} />
              <div
                style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
              >
                System is running smoothly
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent Activities" style={{ height: "400px" }}>
            <Table
              dataSource={getRecentActivities()}
              columns={activityColumns}
              pagination={false}
              size="small"
              style={{ height: "100%" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card
            style={{
              textAlign: "center",
              backgroundColor: "#e6f7ff",
              border: "1px solid #91d5ff",
            }}
          >
            <CheckCircleOutlined
              style={{
                fontSize: "32px",
                color: "#1890ff",
                marginBottom: "8px",
              }}
            />
            <Title level={4} style={{ color: "#1890ff", margin: 0 }}>
              Secure
            </Title>
            <Text type="secondary">System Security Status</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            style={{
              textAlign: "center",
              backgroundColor: "#f6ffed",
              border: "1px solid #b7eb8f",
            }}
          >
            <ArrowUpOutlined
              style={{
                fontSize: "32px",
                color: "#52c41a",
                marginBottom: "8px",
              }}
            />
            <Title level={4} style={{ color: "#52c41a", margin: 0 }}>
              Growing
            </Title>
            <Text type="secondary">User Base Expansion</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            style={{
              textAlign: "center",
              backgroundColor: "#fff7e6",
              border: "1px solid #ffd591",
            }}
          >
            <WarningOutlined
              style={{
                fontSize: "32px",
                color: "#faad14",
                marginBottom: "8px",
              }}
            />
            <Title level={4} style={{ color: "#faad14", margin: 0 }}>
              Monitoring
            </Title>
            <Text type="secondary">Active Threat Detection</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
