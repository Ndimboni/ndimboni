// pages/admin/reports/week.js
import Head from 'next/head'
import AdminLayout from '../../../components/Admin/AdminLayout'
import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Typography, Row, Col, Statistic, message, Modal, Descriptions, DatePicker, Select } from 'antd'
import { FileTextOutlined, EyeOutlined, CalendarOutlined, TrophyOutlined, ExclamationCircleOutlined, BarChartOutlined, FilterOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

function WeekReports() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [stats, setStats] = useState({
    totalWeek: 0,
    verified: 0,
    pending: 0,
    highRisk: 0,
    dailyTrend: []
  })

  useEffect(() => {
    fetchWeekReports()
    fetchStats()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, selectedType, selectedStatus])

  const fetchWeekReports = async () => {
    try {
      setLoading(true)
      // Mock data for the week
      const mockData = [
        // Today's reports (18th June)
        {
          key: 1,
          title: 'Fake Banking Website',
          type: 'Phishing',
          url: 'https://fake-bk-portal.com',
          description: 'Website impersonating Bank of Kigali login portal',
          reporterName: 'Alice Uwimana',
          reporterEmail: 'alice.u@example.com',
          timeReported: '2024-06-18 14:30:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Screenshots and URL analysis'
        },
        {
          key: 2,
          title: 'Investment Scam Email',
          type: 'Investment',
          url: 'N/A',
          description: 'Email promising 300% returns on forex investment',
          reporterName: 'John Mugisha',
          reporterEmail: 'john.m@example.com',
          timeReported: '2024-06-18 13:15:00',
          status: 'Under Review',
          riskLevel: 'Medium',
          evidence: 'Email screenshots'
        },
        // Yesterday's reports (17th June)
        {
          key: 3,
          title: 'Fake Government Portal',
          type: 'Phishing',
          url: 'https://fake-gov-portal.rw',
          description: 'Website impersonating MINECOFIN tax portal',
          reporterName: 'Marie Uwizeye',
          reporterEmail: 'marie.u@example.com',
          timeReported: '2024-06-17 16:45:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Website analysis and user reports'
        },
        {
          key: 4,
          title: 'Social Media Romance Scam',
          type: 'Romance',
          url: 'Facebook Profile',
          description: 'Fake profile targeting elderly users for money',
          reporterName: 'Paul Nzeyimana',
          reporterEmail: 'paul.n@example.com',
          timeReported: '2024-06-17 11:20:00',
          status: 'Investigating',
          riskLevel: 'Medium',
          evidence: 'Chat screenshots and profile analysis'
        },
        // 16th June reports
        {
          key: 5,
          title: 'Mobile Money Fraud Call',
          type: 'Mobile Money',
          url: '+250788555333',
          description: 'Caller impersonating MTN MoMo support requesting PIN',
          reporterName: 'Agnes Mukamana',
          reporterEmail: 'agnes.m@example.com',
          timeReported: '2024-06-16 14:10:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Call recording and transaction logs'
        },
        {
          key: 6,
          title: 'Fake Job Opportunity',
          type: 'Employment',
          url: 'https://jobs-kigali-fake.com',
          description: 'Website offering fake overseas employment opportunities',
          reporterName: 'Robert Uwimana',
          reporterEmail: 'robert.u@example.com',
          timeReported: '2024-06-16 09:30:00',
          status: 'Under Review',
          riskLevel: 'Medium',
          evidence: 'Website screenshots and email correspondence'
        },
        // 15th June reports
        {
          key: 7,
          title: 'Cryptocurrency Mining Scam',
          type: 'Investment',
          url: 'https://crypto-mine-rw.com',
          description: 'Website promoting fake Bitcoin mining investment',
          reporterName: 'Christine Nyiramana',
          reporterEmail: 'christine.n@example.com',
          timeReported: '2024-06-15 13:25:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Financial analysis and user testimonials'
        },
        // 14th June reports
        {
          key: 8,
          title: 'Tech Support Scam',
          type: 'Tech Support',
          url: '+250788444222',
          description: 'Caller claiming computer virus, requesting remote access',
          reporterName: 'Daniel Habimana',
          reporterEmail: 'daniel.h@example.com',
          timeReported: '2024-06-14 10:15:00',
          status: 'Verified',
          riskLevel: 'Medium',
          evidence: 'Call logs and screen recordings'
        },
        // 13th June reports
        {
          key: 9,
          title: 'Insurance Fraud Email',
          type: 'Insurance',
          url: 'N/A',
          description: 'Email claiming accident compensation requiring upfront fee',
          reporterName: 'Immaculee Uwera',
          reporterEmail: 'immaculee.u@example.com',
          timeReported: '2024-06-13 15:40:00',
          status: 'Under Review',
          riskLevel: 'Medium',
          evidence: 'Email headers and content analysis'
        },
        // 12th June reports
        {
          key: 10,
          title: 'Fake Charity SMS',
          type: 'Charity',
          url: '+250788111999',
          description: 'SMS requesting donations for fake disaster relief',
          reporterName: 'Samuel Nkurunziza',
          reporterEmail: 'samuel.n@example.com',
          timeReported: '2024-06-12 12:30:00',
          status: 'Verified',
          riskLevel: 'Low',
          evidence: 'SMS screenshots and sender verification'
        }
      ]
      
      setReports(mockData)
      setLoading(false)
    } catch (error) {
      message.error('Failed to fetch week reports')
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock weekly trend data
      const dailyTrend = [
        { date: '12 Jun', reports: 1, verified: 1 },
        { date: '13 Jun', reports: 1, verified: 0 },
        { date: '14 Jun', reports: 1, verified: 1 },
        { date: '15 Jun', reports: 1, verified: 1 },
        { date: '16 Jun', reports: 2, verified: 1 },
        { date: '17 Jun', reports: 2, verified: 1 },
        { date: '18 Jun', reports: 2, verified: 1 }
      ]

      setStats({
        totalWeek: 10,
        verified: 6,
        pending: 3,
        highRisk: 4,
        dailyTrend
      })
    } catch (error) {
      message.error('Failed to fetch statistics')
    }
  }

  const filterReports = () => {
    let filtered = reports

    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.type === selectedType)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus)
    }

    setFilteredReports(filtered)
  }

  const handleViewReport = (report) => {
    setSelectedReport(report)
    setModalVisible(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'success'
      case 'Under Review':
        return 'processing'
      case 'Investigating':
        return 'warning'
      case 'Pending':
        return 'default'
      default:
        return 'default'
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High':
        return 'red'
      case 'Medium':
        return 'orange'
      case 'Low':
        return 'green'
      default:
        return 'default'
    }
  }

  const scamTypes = [...new Set(reports.map(report => report.type))]
  const statuses = [...new Set(reports.map(report => report.status))]

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color="blue">{type}</Tag>
    },
    {
      title: 'Reporter',
      dataIndex: 'reporterName',
      key: 'reporterName'
    },
    {
      title: 'Date',
      dataIndex: 'timeReported',
      key: 'timeReported',
      render: (time) => new Date(time).toLocaleDateString()
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (risk) => <Tag color={getRiskColor(risk)}>{risk}</Tag>
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewReport(record)}
          size="small"
        >
          View Details
        </Button>
      )
    }
  ]

  return (
    <AdminLayout>
      <Head>
        <title>This Week's Reports - Ndimboni Admin</title>
      </Head>

      <div style={{ padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={2} style={{ color: '#1A5276', marginBottom: '24px' }}>
            <CalendarOutlined style={{ marginRight: '12px' }} />
            This Week's Scam Reports
          </Title>
        </motion.div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <Statistic
                  title="Total Reports This Week"
                  value={stats.totalWeek}
                  prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <Statistic
                  title="Verified Reports"
                  value={stats.verified}
                  prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <Statistic
                  title="Pending Review"
                  value={stats.pending}
                  prefix={<ExclamationCircleOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <Statistic
                  title="High Risk"
                  value={stats.highRisk}
                  prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Weekly Trend Chart */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card title={<><BarChartOutlined /> Weekly Trend</>}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reports" fill="#1890ff" name="Total Reports" />
                    <Bar dataKey="verified" fill="#52c41a" name="Verified" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card>
              <Space wrap>
                <FilterOutlined style={{ color: '#1A5276' }} />
                <Text strong>Filters:</Text>
                <Select
                  style={{ width: 150 }}
                  placeholder="Select Type"
                  value={selectedType}
                  onChange={setSelectedType}
                >
                  <Option value="all">All Types</Option>
                  {scamTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
                <Select
                  style={{ width: 150 }}
                  placeholder="Select Status"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                >
                  <Option value="all">All Statuses</Option>
                  {statuses.map(status => (
                    <Option key={status} value={status}>{status}</Option>
                  ))}
                </Select>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card
            title="Weekly Reports"
            extra={
              <Space>
                <Button type="primary" icon={<FileTextOutlined />}>
                  Export Report
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredReports}
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} items`
              }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </motion.div>

        {/* Report Details Modal */}
        <Modal
          title="Report Details"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          ]}
          width={800}
        >
          {selectedReport && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Title">
                {selectedReport.title}
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">{selectedReport.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="URL/Contact">
                {selectedReport.url}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedReport.description}
              </Descriptions.Item>
              <Descriptions.Item label="Reporter Name">
                {selectedReport.reporterName}
              </Descriptions.Item>
              <Descriptions.Item label="Reporter Email">
                {selectedReport.reporterEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Time Reported">
                {new Date(selectedReport.timeReported).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedReport.status)}>
                  {selectedReport.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Risk Level">
                <Tag color={getRiskColor(selectedReport.riskLevel)}>
                  {selectedReport.riskLevel}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Evidence">
                {selectedReport.evidence}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default WeekReports