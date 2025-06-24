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
  Upload,
  Image,
  Divider,
  Switch,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  EditOutlined as DraftOutlined,
  UploadOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const API_BASE_URL = "https://ndimboniapi.ini.rw/education-resources";

const ResourceStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

const BlogManagementPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [blogModalVisible, setBlogModalVisible] = useState(false);
  const [detailsDrawerVisible, setDetailsDrawerVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [blogFormData, setBlogFormData] = useState({
    title: "",
    description: "",
    url: "",
    imageUrl: "",
    category: "",
    status: ResourceStatus.DRAFT,
    nextResourceId: "",
    parentId: "",
  });

  const [blogForm] = Form.useForm();

  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }
      return {
        Authorization: `Bearer ${token}`,
      };
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError(true);
      return {};
    }
  };

  const apiCall = async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const authHeaders = getAuthHeaders();

      if (Object.keys(authHeaders).length === 0) {
        throw new Error("Authentication required");
      }

      const config = {
        method: "GET",
        headers: {
          ...authHeaders,
        },
        ...options,
      };

      if (
        options.body &&
        (config.method === "POST" ||
          config.method === "PUT" ||
          config.method === "PATCH")
      ) {
        if (options.body instanceof FormData) {
        } else {
          config.headers["Content-Type"] = "application/json";
          config.body = JSON.stringify(options.body);
        }
      }

      console.log("API Call:", {
        url,
        method: config.method,
        hasAuth: !!authHeaders.Authorization,
        contentType: config.headers["Content-Type"],
      });

      const response = await fetch(url, config);

      if (response.status === 401 || response.status === 403) {
        console.error("Authentication failed");
        setAuthError(true);
        throw new Error("Authentication failed. Please log in again.");
      }

      if (response.status === 404) {
        throw new Error("Resource not found. Please check the API endpoint.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Server error (${response.status}): ${
            errorText || response.statusText
          }`
        );
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error("API Call Error:", error);

      if (
        error.message.includes("Authentication") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        setAuthError(true);
      }

      throw error;
    }
  };

  const calculateStats = (blogList) => {
    const total = blogList.length;
    const published = blogList.filter(
      (blog) => blog.status === ResourceStatus.PUBLISHED
    ).length;
    const draft = blogList.filter(
      (blog) => blog.status === ResourceStatus.DRAFT
    ).length;

    setStats({
      total,
      published,
      draft,
    });
  };

  const fetchBlogs = async () => {
    if (authError) {
      console.log("Skipping fetch due to auth error");
      return;
    }

    try {
      setLoading(true);
      const response = await apiCall("");

      let blogData = [];
      if (Array.isArray(response)) {
        blogData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        blogData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        blogData = response.data;
      } else {
        console.warn("Unexpected response format:", response);
        blogData = [];
      }

      setBlogs(blogData);
      calculateStats(blogData);
      setPagination((prev) => ({
        ...prev,
        total: blogData.length,
      }));
    } catch (error) {
      console.error("Blogs fetch error:", error);
      if (!authError) {
        message.error(`Failed to fetch blogs: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
      return false;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setUploadedImageFile(file);
    setBlogFormData((prev) => ({ ...prev, imageUrl: "" })); // Clear URL when file is uploaded

    return false; // Prevent automatic upload
  };

  const submitBlog = async (formData) => {
    try {
      if (!formData.title?.trim() || !formData.description?.trim()) {
        message.error(
          "Please fill in all required fields (title and description)"
        );
        return;
      }

      if (formData.description.trim().length < 10) {
        message.error("Description must be at least 10 characters");
        return;
      }

      let requestData;
      let requestOptions = {};

      if (editMode) {
        requestData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          url: formData.url?.trim() || "",
          imageUrl: formData.imageUrl || "",
          category: formData.category?.trim() || "",
          status: formData.status || ResourceStatus.DRAFT,
          nextResourceId: formData.nextResourceId || "",
          parentId: formData.parentId || "",
        };

        Object.keys(requestData).forEach((key) => {
          if (requestData[key] === "") {
            delete requestData[key];
          }
        });

        requestOptions = {
          method: "PATCH",
          body: requestData,
        };
      } else {
        requestData = new FormData();
        requestData.append("title", formData.title.trim());
        requestData.append("description", formData.description.trim());

        if (formData.url?.trim())
          requestData.append("url", formData.url.trim());

        // Handle image - either file upload or URL
        if (uploadedImageFile) {
          requestData.append("image", uploadedImageFile);
        } else if (formData.imageUrl?.trim()) {
          requestData.append("imageUrl", formData.imageUrl.trim());
        }

        if (formData.category?.trim())
          requestData.append("category", formData.category.trim());
        if (formData.nextResourceId)
          requestData.append("nextResourceId", formData.nextResourceId);
        if (formData.parentId)
          requestData.append("parentId", formData.parentId);

        requestData.append("status", formData.status || ResourceStatus.DRAFT);

        requestOptions = {
          method: "POST",
          body: requestData,
        };
      }

      const endpoint = editMode ? `/${selectedBlog.id}` : "";
      console.log("Submitting blog:", {
        editMode,
        endpoint,
        method: requestOptions.method,
        dataType: editMode ? "JSON" : "FormData",
        hasImageFile: !!uploadedImageFile,
        hasImageUrl: !!formData.imageUrl,
      });

      const response = await apiCall(endpoint, requestOptions);

      if (response) {
        message.success(
          `Blog ${editMode ? "updated" : "created"} successfully`
        );
        setBlogModalVisible(false);
        resetForm();
        fetchBlogs();
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Submit blog error:", error);
      message.error(
        `Failed to ${editMode ? "update" : "create"} blog: ${error.message}`
      );
    }
  };

  const fetchBlogDetails = async (id) => {
    try {
      const response = await apiCall(`/admin/${id}`);
      if (response) {
        setSelectedBlog(response);
        setDetailsDrawerVisible(true);
      }
    } catch (error) {
      console.error("Fetch details error:", error);
      message.error(`Failed to fetch blog details: ${error.message}`);
    }
  };

  const deleteBlog = async (id) => {
    try {
      await apiCall(`/${id}`, {
        method: "DELETE",
      });

      message.success("Blog deleted successfully");
      fetchBlogs();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(`Failed to delete blog: ${error.message}`);
    }
  };

  const editBlog = (blog) => {
    setEditMode(true);
    setSelectedBlog(blog);
    setBlogFormData({
      title: blog.title || "",
      description: blog.description || "",
      url: blog.url || "",
      imageUrl: blog.imageUrl || "",
      category: blog.category || "",
      status: blog.status || ResourceStatus.DRAFT,
      nextResourceId: blog.nextResourceId || "",
      parentId: blog.parentId || "",
    });
    blogForm.setFieldsValue({
      title: blog.title || "",
      description: blog.description || "",
      url: blog.url || "",
      imageUrl: blog.imageUrl || "",
      category: blog.category || "",
      status: blog.status || ResourceStatus.DRAFT,
      nextResourceId: blog.nextResourceId || "",
      parentId: blog.parentId || "",
    });
    setImagePreview(blog.imageUrl || "");
    setUploadedImageFile(null);
    setBlogModalVisible(true);
  };

  const resetForm = () => {
    setEditMode(false);
    setSelectedBlog(null);
    setBlogFormData({
      title: "",
      description: "",
      url: "",
      imageUrl: "",
      category: "",
      status: ResourceStatus.DRAFT,
      nextResourceId: "",
      parentId: "",
    });
    blogForm.resetFields();
    setUploadedImageFile(null);
    setImagePreview(null);

    // Clean up preview URL if it exists
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      [ResourceStatus.DRAFT]: "orange",
      [ResourceStatus.PUBLISHED]: "green",
    };
    return colors[status] || "gray";
  };

  const getStatusIcon = (status) => {
    const icons = {
      [ResourceStatus.DRAFT]: <DraftOutlined />,
      [ResourceStatus.PUBLISHED]: <CheckCircleOutlined />,
    };
    return icons[status] || <FileTextOutlined />;
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 80,
      render: (imageUrl) =>
        imageUrl ? (
          <Image
            width={50}
            height={50}
            src={imageUrl}
            style={{ objectFit: "cover", borderRadius: "4px" }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAxNUwyOSAyM0gyMSAyM0wyNSAxNVoiIGZpbGw9IiNCQkJCQkIiLz4KPC9zdmc+"
          />
        ) : (
          <div
            style={{
              width: 50,
              height: 50,
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
            }}
          >
            <FileTextOutlined />
          </div>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (title) => <Text strong>{title}</Text>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category) =>
        category ? (
          <Tag color="blue">{category}</Tag>
        ) : (
          <Text type="secondary">No category</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status?.toUpperCase() || "DRAFT"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (date ? new Date(date).toLocaleDateString() : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => fetchBlogDetails(record.id)}
            title="View Details"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => editBlog(record)}
            title="Edit"
          />
          <Popconfirm
            title="Delete this blog?"
            description="This action cannot be undone."
            onConfirm={() => deleteBlog(record.id)}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setAuthError(true);
      return;
    }

    if (!authError) {
      fetchBlogs();
    }
  }, []);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (authError) {
    return (
      <div style={{ padding: "24px" }}>
        <Alert
          message="Authentication Required"
          description="Please log in to access this page. Make sure you have a valid access token."
          type="error"
          showIcon
          action={
            <Button
              size="small"
              onClick={() => {
                window.location.href = "/login";
              }}
            >
              Go to Login
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Blog Management</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Total Blogs"
              value={stats.total}
              loading={statsLoading}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Published"
              value={stats.published}
              valueStyle={{ color: "#3f8600" }}
              loading={statsLoading}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Drafts"
              value={stats.draft}
              valueStyle={{ color: "#fa8c16" }}
              loading={statsLoading}
              prefix={<DraftOutlined />}
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
                Education Resources
              </Title>
            </Col>

            <Col xs={24} sm={12}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchBlogs()}
                  loading={loading}
                  style={{ flex: "0 0 auto", minWidth: "80px" }}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    resetForm();
                    setBlogModalVisible(true);
                  }}
                  style={{
                    flex: "1 1 auto",
                    minWidth: "120px",
                    maxWidth: "150px",
                  }}
                >
                  Add Blog
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={blogs}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} blogs`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Blog Modal */}
      <Modal
        title={editMode ? "Edit Blog" : "Create New Blog"}
        open={blogModalVisible}
        onCancel={() => {
          setBlogModalVisible(false);
          resetForm();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={blogForm}
          layout="vertical"
          onFinish={() => submitBlog(blogFormData)}
        >
          <Row gutter={16}>
            <Col span={24}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Title *
                </label>
                <Input
                  placeholder="Enter blog title"
                  value={blogFormData.title}
                  onChange={(e) =>
                    setBlogFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Category
                </label>
                <Input
                  placeholder="Enter category (optional)"
                  value={blogFormData.category}
                  onChange={(e) =>
                    setBlogFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  External URL
                </label>
                <Input
                  placeholder="Enter external URL (optional)"
                  addonBefore={<GlobalOutlined />}
                  value={blogFormData.url}
                  onChange={(e) =>
                    setBlogFormData((prev) => ({
                      ...prev,
                      url: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
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
                  rows={6}
                  placeholder="Enter detailed description of the blog content..."
                  value={blogFormData.description}
                  onChange={(e) =>
                    setBlogFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Blog Image
                </label>
                <div style={{ marginBottom: "12px" }}>
                  <Upload
                    name="image"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    beforeUpload={handleImageUpload}
                  >
                    {imagePreview || uploadedImageFile ? (
                      <img
                        src={imagePreview}
                        alt="blog"
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload Image</div>
                      </div>
                    )}
                  </Upload>
                </div>
                <Text type="secondary">Or provide image URL:</Text>
                <Input
                  placeholder="Enter image URL"
                  value={blogFormData.imageUrl}
                  onChange={(e) => {
                    setBlogFormData((prev) => ({
                      ...prev,
                      imageUrl: e.target.value,
                    }));
                    if (e.target.value) {
                      setImagePreview(e.target.value);
                      setUploadedImageFile(null); // Clear file when URL is provided
                    }
                  }}
                  style={{ marginTop: "8px" }}
                />
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Status
                </label>
                <Select
                  value={blogFormData.status}
                  onChange={(value) =>
                    setBlogFormData((prev) => ({ ...prev, status: value }))
                  }
                  style={{ width: "100%" }}
                >
                  <Option value={ResourceStatus.DRAFT}>Draft</Option>
                  <Option value={ResourceStatus.PUBLISHED}>Published</Option>
                </Select>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Parent Resource ID
                </label>
                <Input
                  placeholder="Parent ID (optional)"
                  value={blogFormData.parentId}
                  onChange={(e) =>
                    setBlogFormData((prev) => ({
                      ...prev,
                      parentId: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>
            <Col span={8}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Next Resource ID
                </label>
                <Input
                  placeholder="Next resource ID (optional)"
                  value={blogFormData.nextResourceId}
                  onChange={(e) =>
                    setBlogFormData((prev) => ({
                      ...prev,
                      nextResourceId: e.target.value,
                    }))
                  }
                />
              </div>
            </Col>
          </Row>

          <div style={{ textAlign: "right", marginTop: "24px" }}>
            <Space>
              <Button
                onClick={() => {
                  setBlogModalVisible(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={() => submitBlog(blogFormData)}>
                {editMode ? "Update Blog" : "Create Blog"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Blog Details"
        placement="right"
        width={600}
        open={detailsDrawerVisible}
        onClose={() => setDetailsDrawerVisible(false)}
      >
        {selectedBlog && (
          <div>
            <Card title="Basic Information" style={{ marginBottom: "16px" }}>
              {selectedBlog.imageUrl && (
                <div style={{ marginBottom: "16px", textAlign: "center" }}>
                  <Image
                    width="100%"
                    height={200}
                    src={selectedBlog.imageUrl}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                </div>
              )}

              <List size="small">
                <List.Item>
                  <Text strong>Title:</Text>
                  <Text>{selectedBlog.title}</Text>
                </List.Item>
                <List.Item>
                  <Text strong>Category:</Text>
                  {selectedBlog.category ? (
                    <Tag color="blue">{selectedBlog.category}</Tag>
                  ) : (
                    <Text type="secondary">No category</Text>
                  )}
                </List.Item>
                <List.Item>
                  <Text strong>Status:</Text>
                  <Tag
                    icon={getStatusIcon(selectedBlog.status)}
                    color={getStatusColor(selectedBlog.status)}
                  >
                    {selectedBlog.status?.toUpperCase() || "DRAFT"}
                  </Tag>
                </List.Item>
                {selectedBlog.url && (
                  <List.Item>
                    <Text strong>External URL:</Text>
                    <a
                      href={selectedBlog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedBlog.url}
                    </a>
                  </List.Item>
                )}
                <List.Item>
                  <Text strong>Created:</Text>
                  <Text>
                    {new Date(selectedBlog.createdAt).toLocaleString()}
                  </Text>
                </List.Item>
                {selectedBlog.updatedAt && (
                  <List.Item>
                    <Text strong>Last Updated:</Text>
                    <Text>
                      {new Date(selectedBlog.updatedAt).toLocaleString()}
                    </Text>
                  </List.Item>
                )}
              </List>
            </Card>

            <Card title="Description" style={{ marginBottom: "16px" }}>
              <Paragraph>{selectedBlog.description}</Paragraph>
            </Card>

            {(selectedBlog.parentId || selectedBlog.nextResourceId) && (
              <Card title="Resource Relationships">
                <List size="small">
                  {selectedBlog.parentId && (
                    <List.Item>
                      <Text strong>Parent Resource:</Text>
                      <Text code>{selectedBlog.parentId}</Text>
                    </List.Item>
                  )}
                  {selectedBlog.nextResourceId && (
                    <List.Item>
                      <Text strong>Next Resource:</Text>
                      <Text code>{selectedBlog.nextResourceId}</Text>
                    </List.Item>
                  )}
                </List>
              </Card>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default BlogManagementPage;
