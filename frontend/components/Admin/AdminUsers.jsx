import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Space, 
  Popconfirm, 
  message, 
  Tag, 
  Tooltip,
  Alert,
  Spin,
  Card,
  Row,
  Col,
  Typography
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [authState, setAuthState] = useState({
    isAuthorized: false,
    isClient: false,
    isChecking: true
  });

 
  const checkAuthorization = useCallback(() => {
    if (typeof window === 'undefined') return false;
    
    try {
      const userRole = localStorage.getItem('user_role');
      const accessToken = localStorage.getItem('access_token');
      
      if (!userRole || !accessToken) {
        return false;
      }
      
      return userRole === 'admin';
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  }, []);

 
  const getAuthHeaders = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

 
  const fetchUsers = useCallback(async (retryCount = 0) => {
    if (!authState.isAuthorized && !authState.isChecking) return;
    
    try {
      setLoading(true);
      
     
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); 
      
      const response = await fetch('https://ndimboniapi.ini.rw/users', {
        headers: getAuthHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      
     
      if (retryCount < 2 && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log(`Retrying fetch... Attempt ${retryCount + 1}`);
        setTimeout(() => fetchUsers(retryCount + 1), 2000);
        return;
      }
      
      if (error.name === 'AbortError') {
        message.error('Request timed out. The server might be slow. Please try again.');
      } else {
        message.error('Failed to fetch users. Please check your connection.');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthorized, authState.isChecking, getAuthHeaders]);

 
  const createUser = async (userData) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://ndimboniapi.ini.rw/auth/register', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      const newUser = await response.json();
      message.success('User created successfully');
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.name === 'AbortError') {
        message.error('Request timed out. Please try again.');
      } else {
        message.error(error.message || 'Failed to create user');
      }
      throw error;
    }
  };


  const updateUser = async (userId, userData) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`https://ndimboniapi.ini.rw/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const updatedUser = await response.json();
      message.success('User updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      if (error.name === 'AbortError') {
        message.error('Request timed out. Please try again.');
      } else {
        message.error(error.message || 'Failed to update user');
      }
      throw error;
    }
  };

  
  const deleteUser = async (userId) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`https://ndimboniapi.ini.rw/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      message.success('User deleted successfully');
      fetchUsers(); 
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.name === 'AbortError') {
        message.error('Request timed out. Please try again.');
      } else {
        message.error(error.message || 'Failed to delete user');
      }
    }
  };

 
  const handleSubmit = async (values) => {
    try {
      if (modalMode === 'add') {
        await createUser(values);
      } else {
        await updateUser(selectedUser.id, values);
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      
    }
  };

 
  const handleEdit = useCallback((user) => {
    setSelectedUser(user);
    setModalMode('edit');
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
    setIsModalVisible(true);
  }, [form]);

  
  const handleView = useCallback((user) => {
    setSelectedUser(user);
    setIsViewModalVisible(true);
  }, []);

 
  const handleAddNew = useCallback(() => {
    setSelectedUser(null);
    setModalMode('add');
    form.resetFields();
    setIsModalVisible(true);
  }, [form]);

  
  const filteredUsers = useMemo(() => {
    if (!searchText) return users;
    
    return users.filter(user => 
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [users, searchText]);

 
  const columns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Tooltip title="Delete User">
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => deleteUser(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: '#ff4d4f' }}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ], [handleView, handleEdit, deleteUser]);

  useEffect(() => {
    const initializeComponent = async () => {
     
      if (typeof window === 'undefined') return;
      
      const isAuthorized = checkAuthorization();
      
     
      setAuthState({
        isClient: true,
        isAuthorized,
        isChecking: false
      });
      
    
      if (isAuthorized) {
      
        setTimeout(() => fetchUsers(), 100);
      } else {
        setLoading(false);
      }
    };
    
    initializeComponent();
  }, [checkAuthorization, fetchUsers]);

 
  if (!authState.isClient || authState.isChecking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Spin size="large" tip="Initializing..." />
      </div>
    );
  }

  if (!authState.isAuthorized) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Access Denied"
          description="You don't have permission to access this page. Admin role required."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Users Management</Title>
      
      {loading && (
        <Alert
          message="Loading users..."
          description="This might take a moment if the server is starting up."
          type="info"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={16} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchUsers()}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddNew}
              >
                Add User
              </Button>
            </Space>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={modalMode === 'add' ? 'Add New User' : 'Edit User'}
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setSelectedUser(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role: 'user',
            isActive: true
          }}
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[
              { required: true, message: 'Please input the full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please input the email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="Enter email address" disabled={modalMode === 'edit'} />
          </Form.Item>

          {modalMode === 'add' && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please input the password!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role!' }]}
          >
            <Select placeholder="Select role">
                <Option value="user">User</Option>
              <Option value="moderator">Moderator</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Status"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {modalMode === 'add' ? 'Create User' : 'Update User'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title="User Details"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>
        ]}
        width={500}
      >
        {selectedUser && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={8}><strong>Name:</strong></Col>
              <Col span={16}>{selectedUser.name}</Col>
              
              <Col span={8}><strong>Email:</strong></Col>
              <Col span={16}>{selectedUser.email}</Col>
              
              <Col span={8}><strong>Role:</strong></Col>
              <Col span={16}>
                <Tag color={selectedUser.role === 'admin' ? 'red' : 'blue'}>
                  {selectedUser.role?.toUpperCase()}
                </Tag>
              </Col>
              
              <Col span={8}><strong>Status:</strong></Col>
              <Col span={16}>
                <Tag color={selectedUser.isActive ? 'green' : 'red'}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </Tag>
              </Col>
              
              <Col span={8}><strong>Created:</strong></Col>
              <Col span={16}>
                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
              </Col>
              
              <Col span={8}><strong>Updated:</strong></Col>
              <Col span={16}>
                {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString() : 'N/A'}
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsersPage;