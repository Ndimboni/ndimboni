import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  SecurityScanOutlined,
  PhoneOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import AdminDashboard from './Dashboard';

const { Header, Sider, Content } = Layout;

// Component imports for different pages
const UsersPage = () => (
  <div style={{ padding: '24px' }}>
    <h2>Users Management</h2>
    <p>Users page content will be displayed here...</p>
  </div>
);

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

const NumberEmailReportsPage = () => (
  <div style={{ padding: '24px' }}>
    <h2>Number/Email Reports</h2>
    <p>Number and email reports content will be displayed here...</p>
  </div>
);

const AdminLayout = ({ children, currentPage = 'dashboard' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState('Admin User');
  const [selectedKey, setSelectedKey] = useState(currentPage);

  const getUserInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  useEffect(() => {
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    const storedUserName = 'John Doe'; 
    if (storedUserName) {
      setUserName(storedUserName);
    }
    
    // Update selected key when currentPage prop changes
    setSelectedKey(currentPage);
    
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
    setSelectedKey(key);
    
    // Close mobile menu when item is selected
    if (isMobile) {
      setIsOpen(false);
    }
    
    // Navigate to the appropriate page
    const routes = {
      'dashboard': '/admin/dashboard',
      'users': '/admin/users',
      'scam-reports': '/admin/scam-reports',
      'scam-check': '/admin/scam-check',
      'number-email-reports': '/admin/number-email-reports'
    };
    
    if (routes[key]) {
      window.location.href = routes[key];
    }
  };

  const renderPageContent = () => {
    // If children prop is provided, use it (for custom page content)
    if (children) {
      return children;
    }
    
    // Otherwise, render based on selectedKey
    switch (selectedKey) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UsersPage />;
      case 'scam-reports':
        return <ScamReportsPage />;
      case 'scam-check':
        return <ScamCheckPage />;
      case 'number-email-reports':
        return <NumberEmailReportsPage />;
      default:
        return <AdminDashboard />;
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile Settings',
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
      key: 'users',
      icon: <UserOutlined />,
      label: 'Users',
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
      key: 'number-email-reports',
      icon: <PhoneOutlined />,
      label: 'Number/Email Reports',
    },
  ];

  const sidebarCollapsed = isMobile ? !isOpen : collapsed;

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
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
                  Administrator
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
                  marginRight:'30px',
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

      {/* Custom Menu Styles */}
      <style jsx>{`
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

export default AdminLayout;