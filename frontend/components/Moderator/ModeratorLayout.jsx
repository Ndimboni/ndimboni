import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Modal,  Typography,  message } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
   MessageOutlined,
} from '@ant-design/icons';
import AdminDashboard from './Dashboard';


const API_BASE_URL = 'https://ndimboniapi.ini.rw';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;



const ScamReportsPage = () => (
  <div style={{ padding: '24px' }}>
    <h2>Scam Reports</h2>
    <p>Scam reports content will be displayed here...</p>
  </div>
);

const ScamCheckPage = () => (
  <div style={{ padding: '24px' }}>
    <h2>Scam Check</h2>
    <p>Scam check content will be displayed here...</p>
  </div>
);



const ModeratorLayout = ({ children, currentPage = 'dashboard' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Moderator User');
  const [userEmail, setUserEmail] = useState('moderator@ndimboni.com');
  const [userRole, setUserRole] = useState('moderator');
  const [selectedKey, setSelectedKey] = useState(currentPage);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
   const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const getRoleDisplay = (role) => {
    return role === 'moderator' ? 'Moderator' : 'Admin';
  };

  
  const fetchUnreadMessagesCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/contact/unread-count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadMessagesCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    }
  };

  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error('No access token found');
        return;
      }

      const response = await fetch('https://ndimboniapi.ini.rw/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        
        
        if (data.user_name) setUserName(data.user_name);
        if (data.user_email) setUserEmail(data.user_email);
        if (data.user_role) setUserRole(data.user_role);
        
       
        localStorage.setItem('user_name', data.user_name || '');
        localStorage.setItem('user_email', data.user_email || '');
        localStorage.setItem('user_role', data.user_role || '');
      } else {
        message.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Error fetching profile data');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileClick = () => {
    setProfileModalVisible(true);
    fetchUserProfile();
  };

  useEffect(() => {
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
   
    const storedUserName = localStorage.getItem('user_name') || 'Moderator User';
    const storedUserEmail = localStorage.getItem('user_email') || 'moderator@ndimboni.com';
    const storedUserRole = localStorage.getItem('user_role') || 'moderator';
    
    setUserName(storedUserName);
    setUserEmail(storedUserEmail);
    setUserRole(storedUserRole);
    
    setSelectedKey(currentPage);

    //Fetch unread messages count on component mount
    fetchUnreadMessagesCount();
    
    // Set up interval to fetch unread count periodically (every 30 seconds)
    const interval = setInterval(fetchUnreadMessagesCount, 30000);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [currentPage]);

  const checkIfMobile = () => {
    const mobile = window.innerWidth <= 768;
    setIsMobile(mobile);
    
    if (mobile && !isOpen) {
      setIsOpen(false);
    }
  };

  const toggleCollapsed = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
      
      console.log('Storage cleared successfully');
      window.location.href = '/';
      
    } catch (error) {
      console.error('Error during logout:', error);
      window.location.href = '/';
    }
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'profile') {
      handleProfileClick();
      return;
    }
    
    if (key === 'logout') {
      handleLogout();
      return;
    }
    
    setSelectedKey(key);

    if (isMobile) {
      setIsOpen(false);
    }

     // Mark messages as read when navigating to messages page
    if (key === 'messages') {
      setUnreadMessagesCount(0);
    }
    
    const routes = {
      'dashboard': '/moderator/dashboard',
  
      'scam-reports': '/moderator/scam-reports',
      'scam-check': '/moderator/scam-check',
       'messages': '/moderator/messages',
     
    };
    
    if (routes[key]) {
      window.location.href = routes[key];
    }
  };

  const renderPageContent = () => {
    if (children) {
      return children;
    }
    
    switch (selectedKey) {
      case 'dashboard':
        return <AdminDashboard />;
     
      case 'scam-reports':
        return <ScamReportsPage />;
      case 'scam-check':
        return <ScamCheckPage />;
      case 'messages':
        return <div style={{ padding: '24px' }}>
          <h2>Contact Messages</h2>
          <p>Contact messages content will be displayed here...</p>
        </div>;
      
      default:
        return <AdminDashboard />;
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
      onClick: handleProfileClick,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const navItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
  
    {
      key: 'scam-reports',
      icon: <ExclamationCircleOutlined />,
      label: 'Scam Reports',
    },
    {
      key: 'scam-check',
      icon: <SecurityScanOutlined />,
      label: 'Scam Check',
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>Messages</span>
          {unreadMessagesCount > 0 && !collapsed && (
            <Badge 
              count={unreadMessagesCount} 
              size="small"
              style={{ 
                backgroundColor: '#ff4d4f',
                fontSize: '10px',
                minWidth: '16px',
                height: '16px',
                lineHeight: '16px',
                borderRadius: '8px',
                marginLeft: '8px'
              }}
            />
          )}
        </div>
      ),
    },
    
  ];

  const sidebarCollapsed = isMobile ? !isOpen : collapsed;

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Compact Profile Modal */}
      <Modal
        title={null}
        open={profileModalVisible}
        onCancel={() => setProfileModalVisible(false)}
        footer={null}
        width={380}
        centered
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #2980B9, #1A5276)',
            borderRadius: '12px 12px 0 0',
            padding: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '100px',
              height: '100px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '60px',
              height: '60px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '50%',
            }}
          />
          
          <Avatar
            size={70}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '12px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              backdropFilter: 'blur(10px)',
            }}
          >
            {profileData ? getUserInitials(profileData.user_name || userName) : getUserInitials(userName)}
          </Avatar>
          
          <Title 
            level={4} 
            style={{ 
              margin: 0, 
              color: '#ffffff',
              fontWeight: '600',
              fontSize: '18px'
            }}
          >
            {profileData?.user_name || userName}
          </Title>
          
          <Text 
            style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '14px',
              display: 'block',
              marginTop: '4px'
            }}
          >
            {getRoleDisplay(profileData?.user_role || userRole)}
          </Text>
        </div>

        <div style={{ padding: '20px' }}>
          {profileLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 12px',
                }}
              />
              <Text style={{ color: '#64748b' }}>Loading...</Text>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Email */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                  }}
                >
                  <MailOutlined style={{ color: '#ffffff', fontSize: '16px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                    Email Address
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                    {profileData?.user_email || userEmail}
                  </Text>
                </div>
              </div>

              {/* Role */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                  }}
                >
                  <SafetyCertificateOutlined style={{ color: '#ffffff', fontSize: '16px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <Text style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                    Access Level
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#1e293b', fontWeight: '500' }}>
                    {getRoleDisplay(profileData?.user_role || userRole)}
                  </Text>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ 
            marginTop: '20px', 
            display: 'flex', 
            gap: '8px',
            justifyContent: 'center'
          }}>
            <Button
              onClick={() => setProfileModalVisible(false)}
              style={{
                borderRadius: '8px',
                height: '36px',
                paddingLeft: '20px',
                paddingRight: '20px',
                background: 'linear-gradient(135deg, #2980B9, #1A5276)',
                border: '1px solid #e2e8f0',
                color: '#fff',
              }}
            >
              Close
            </Button>
            
          </div>
        </div>
      </Modal>

      {/* Mobile Toggle Button */}
      {isMobile && (
        <Button
          type="text"
          icon={isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={toggleCollapsed}
          style={{
            position: 'fixed',
            top: '12px',
            left: '12px',
            zIndex: 1001,
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        />
      )}

      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={240}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          position: isMobile ? 'fixed' : 'relative',
          height: '100vh',
          left: isMobile ? (isOpen ? '0' : '-240px') : '0',
          zIndex: 1000,
          backgroundColor: '#EBF5FB',
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(41, 128, 185, 0.1)',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
      >
        {/* User Profile Section */}
        <div style={{
          padding: '1.5rem 1rem',
          borderBottom: '1px solid #AED6F1',
          marginBottom: '0.5rem',
          position: 'relative',
          backgroundColor: '#F4F6F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1 }}>
            <Avatar 
              size={sidebarCollapsed ? 32 : 40} 
              style={{ 
                backgroundColor: '#2980B9',
                marginRight: sidebarCollapsed ? '0' : '12px',
                border: '2px solid white',
                flexShrink: 0,
                fontSize: sidebarCollapsed ? '12px' : '16px',
                fontWeight: '600',
              }}
            >
              {sidebarCollapsed ? getUserInitials(userName) : <UserOutlined />}
            </Avatar>
            {!sidebarCollapsed && (
              <div style={{
                marginLeft: '12px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%',
                position: 'relative',
              }}>
                <div style={{ 
                  fontWeight: '600', 
                  fontSize: '0.9rem', 
                  color: '#1A5276',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginBottom: '2px'
                }}>
                  {userName}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#2980B9'
                }}>
                  {getRoleDisplay(userRole)}
                </div>
              </div>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <Dropdown 
              menu={{ items: userMenuItems }} 
              trigger={['click']} 
              placement="bottomRight"
            >
              <Button 
                type="text" 
                icon={<SettingOutlined />} 
                size=""
                style={{ 
                  color: '#2980B9',
                  position: 'absolute',
                  right: '0',
                  top: '50%',
                  marginRight:'20px',
                  transform: 'translateY(-50%)',
                  fontSize: '1rem',
                }}
              />
            </Dropdown>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden', 
          paddingBottom: '60px',
          padding: '12px 0' 
        }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
            }}
            items={navItems.map(item => ({
              ...item,
              style: {
                height: 'auto',
                lineHeight: '1.5',
                padding: sidebarCollapsed ? '12px 0' : '12px 16px',
                margin: '4px 0',
                borderRadius: sidebarCollapsed ? '0' : '0 20px 20px 0',
                marginRight: sidebarCollapsed ? '0' : '16px',
                transition: 'all 0.3s ease',
                color: selectedKey === item.key ? 'white' : '#1A5276',
                backgroundColor: selectedKey === item.key ? '#2980B9' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                minHeight: '48px',
              }
            }))}
          />
        </div>
      </Sider>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .ant-menu-light .ant-menu-item {
          color: #1A5276 !important;
          display: flex !important;
          align-items: center !important;
        }
        .ant-menu-light .ant-menu-item:hover {
          background-color: rgba(41, 128, 185, 0.1) !important;
          color: #2980B9 !important;
        }
        .ant-menu-light .ant-menu-item-selected {
          background-color: #2980B9 !important;
          color: white !important;
        }
        .ant-menu-light .ant-menu-item-selected::after {
          border-right-color: #2980B9 !important;
        }
        .ant-menu-light .ant-menu-item .anticon {
          font-size: 1.25rem !important;
          margin-right: ${sidebarCollapsed ? '0' : '12px'} !important;
          color: inherit !important;
          min-width: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        .ant-menu-light .ant-menu-item-selected .anticon {
          color: white !important;
        }
        .ant-menu-light .ant-menu-item:hover .anticon {
          color: #2980B9 !important;
        }
        .ant-menu-light .ant-menu-item .ant-menu-title-content {
          display: ${sidebarCollapsed ? 'none' : 'inline'} !important;
          margin-left: ${sidebarCollapsed ? '0' : '8px'} !important;
        }
      `}</style>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={toggleCollapsed}
        />
      )}

      {/* Main Layout */}
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 0 : 0),
        transition: 'margin-left 0.2s ease-in-out',
        backgroundColor: '#f8fafc'
      }}>
        {/* Header */}
        <Header style={{
          backgroundColor: '#ffffff',
          padding: '0 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleCollapsed}
                style={{
                  fontSize: '16px',
                  width: 40,
                  height: 40,
                  marginRight: '16px',
                  color: '#475569',
                }}
              />
            )}
            <div>
              <h1 style={{ 
                margin: '0',
                marginLeft: isMobile ? '0' : '20px',
                fontSize: '22px', 
                fontWeight: '700',
                color: '#fff'
              }}>
                {navItems.find(item => item.key === selectedKey)?.label || 'Dashboard'}
              </h1>
            </div>
          </div>
        </Header>

        {/* Content Section */}
        <Content style={{
          margin: '4px 1px',
          padding: '0px',
          minHeight: 'calc(100vh - 112px)',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          overflow: 'auto',
          transition: 'all 0.2s ease-in-out',
        }}>
          {renderPageContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ModeratorLayout;