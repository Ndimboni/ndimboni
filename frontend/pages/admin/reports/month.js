// pages/admin/reports/month.js
import Head from 'next/head'
import AdminLayout from '../../../components/Admin/AdminLayout'
import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Typography, Row, Col, Statistic, message, Modal, Descriptions, Select } from 'antd'
import { FileTextOutlined, EyeOutlined, CalendarOutlined, TrophyOutlined, ExclamationCircleOutlined, BarChartOutlined, FilterOutlined, PieChartOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const { Title, Text } = Typography
const { Option } = Select

function MonthReports() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedRisk, setSelectedRisk] = useState('all')
  const [stats, setStats] = useState({
    totalMonth: 0,
    verified: 0,
    pending: 0,
    highRisk: 0,
    weeklyTrend: [],
    typeDistribution: []
  })

  useEffect(() => {
    fetchMonthReports()
    fetchStats()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, selectedType, selectedStatus, selectedRisk])

  const fetchMonthReports = async () => {
    try {
      setLoading(true)
      // Mock data for the month (June 2024)
      const mockData = [
        // Week 4 (June 18-24)
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
          timeReported: '2024-06-17 13:15:00',
          status: 'Under Review',
          riskLevel: 'Medium',
          evidence: 'Email screenshots'
        },
        {
          key: 3,
          title: 'Mobile Money Fraud',
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
        
        // Week 3 (June 11-17)
        {
          key: 4,
          title: 'Fake Government Portal',
          type: 'Phishing',
          url: 'https://fake-gov-portal.rw',
          description: 'Website impersonating MINECOFIN tax portal',
          reporterName: 'Marie Uwizeye',
          reporterEmail: 'marie.u@example.com',
          timeReported: '2024-06-15 16:45:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Website analysis and user reports'
        },
        {
          key: 5,
          title: 'Romance Scam Profile',
          type: 'Romance',
          url: 'Facebook Profile',
          description: 'Fake profile targeting elderly users for money',
          reporterName: 'Paul Nzeyimana',
          reporterEmail: 'paul.n@example.com',
          timeReported: '2024-06-14 11:20:00',
          status: 'Investigating',
          riskLevel: 'Medium',
          evidence: 'Chat screenshots and profile analysis'
        },
        {
          key: 6,
          title: 'Cryptocurrency Mining Scam',
          type: 'Investment',
          url: 'https://crypto-mine-rw.com',
          description: 'Website promoting fake Bitcoin mining investment',
          reporterName: 'Christine Nyiramana',
          reporterEmail: 'christine.n@example.com',
          timeReported: '2024-06-13 13:25:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Financial analysis and user testimonials'
        },
        {
          key: 7,
          title: 'Tech Support Scam',
          type: 'Tech Support',
          url: '+250788444222',
          description: 'Caller claiming computer virus, requesting remote access',
          reporterName: 'Daniel Habimana',
          reporterEmail: 'daniel.h@example.com',
          timeReported: '2024-06-12 10:15:00',
          status: 'Verified',
          riskLevel: 'Medium',
          evidence: 'Call logs and screen recordings'
        },
        {
          key: 8,
          title: 'Fake Job Opportunity',
          type: 'Employment',
          url: 'https://jobs-kigali-fake.com',
          description: 'Website offering fake overseas employment opportunities',
          reporterName: 'Robert Uwimana',
          reporterEmail: 'robert.u@example.com',
          timeReported: '2024-06-11 09:30:00',
          status: 'Under Review',
          riskLevel: 'Medium',
          evidence: 'Website screenshots and email correspondence'
        },

        // Week 2 (June 4-10)
        {
          key: 9,
          title: 'Insurance Fraud Email',
          type: 'Insurance',
          url: 'N/A',
          description: 'Email claiming accident compensation requiring upfront fee',
          reporterName: 'Immaculee Uwera',
          reporterEmail: 'immaculee.u@example.com',
          timeReported: '2024-06-10 15:40:00',
          status: 'Under Review',
          riskLevel: 'Medium',
          evidence: 'Email headers and content analysis'
        },
        {
          key: 10,
          title: 'Fake Charity SMS',
          type: 'Charity',
          url: '+250788111999',
          description: 'SMS requesting donations for fake disaster relief',
          reporterName: 'Samuel Nkurunziza',
          reporterEmail: 'samuel.n@example.com',
          timeReported: '2024-06-09 12:30:00',
          status: 'Verified',
          riskLevel: 'Low',
          evidence: 'SMS screenshots and sender verification'
        },
        {
          key: 11,
          title: 'Online Shopping Scam',
          type: 'Shopping',
          url: 'https://fake-electronics-rw.com',
          description: 'Website selling non-existent electronics at low prices',
          reporterName: 'Grace Ingabire',
          reporterEmail: 'grace.i@example.com',
          timeReported: '2024-06-08 16:20:00',
          status: 'Verified',
          riskLevel: 'Medium',
          evidence: 'Payment receipts and website analysis'
        },
        {
          key: 12,
          title: 'Social Media Impersonation',
          type: 'Identity Theft',
          url: 'Instagram Account',
          description: 'Fake account impersonating local celebrity for money',
          reporterName: 'Patrick Uwimana',
          reporterEmail: 'patrick.u@example.com',
          timeReported: '2024-06-07 14:15:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Account screenshots and victim reports'
        },
        {
          key: 13,
          title: 'Loan Scam Call',
          type: 'Loan',
          url: '+250788333444',
          description: 'Caller offering instant loans requiring upfront fees',
          reporterName: 'Solange Mukamazera',
          reporterEmail: 'solange.m@example.com',
          timeReported: '2024-06-06 11:45:00',
          status: 'Under Review',
          riskLevel: 'Medium',
          evidence: 'Call recordings and fee requests'
        },
        {
          key: 14,
          title: 'Email Phishing Campaign',
          type: 'Phishing',
          url: 'N/A',
          description: 'Mass email campaign targeting bank customers',
          reporterName: 'Eric Nshimiyimana',
          reporterEmail: 'eric.n@example.com',
          timeReported: '2024-06-05 09:30:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Email samples and IP tracking'
        },
        {
          key: 15,
          title: 'Fake Scholarship Offer',
          type: 'Education',
          url: 'https://fake-scholarships-rw.com',
          description: 'Website offering fake international scholarships',
          reporterName: 'Diane Uwimana',
          reporterEmail: 'diane.u@example.com',
          timeReported: '2024-06-04 13:20:00',
          status: 'Investigating',
          riskLevel: 'Medium',
          evidence: 'Website documentation and application forms'
        },

        // Week 1 (June 1-3)
        {
          key: 16,
          title: 'Lottery Scam SMS',
          type: 'Lottery',
          url: '+250788999111',
          description: 'SMS claiming lottery win requiring processing fee',
          reporterName: 'Jean Baptiste Nzeyimana',
          reporterEmail: 'jb.n@example.com',
          timeReported: '2024-06-03 16:30:00',
          status: 'Verified',
          riskLevel: 'Low',
          evidence: 'SMS screenshots and number verification'
        },
        {
          key: 17,
          title: 'Fake Business Investment',
          type: 'Investment',
          url: 'https://invest-rwanda-fake.com',
          description: 'Website promoting fake real estate investment opportunities',
          reporterName: 'Claudine Mukamana',
          reporterEmail: 'claudine.m@example.com',
          timeReported: '2024-06-02 14:45:00',
          status: 'Under Review',
          riskLevel: 'High',
          evidence: 'Financial projections and company verification'
        },
        {
          key: 18,
          title: 'Medical Insurance Scam',
          type: 'Insurance',
          url: '+250788777555',
          description: 'Caller offering fake health insurance policies',
          reporterName: 'Alphonse Habimana',
          reporterEmail: 'alphonse.h@example.com',
          timeReported: '2024-06-01 10:15:00',
          status: 'Verified',
          riskLevel: 'Medium',
          evidence: 'Call recordings and policy documents'
        }
      ]
      
      setReports(mockData)
      setLoading(false)
    } catch (error) {
      message.error('Failed to fetch month reports')
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock monthly trend data
      const weeklyTrend = [
        { week: 'Week 1', reports: 3, verified: 2, highRisk: 1 },
        { week: 'Week 2', reports: 7, verified: 4, highRisk: 2 },
        { week: 'Week 3', reports: 5, verified: 4, highRisk: 3 },
        { week: 'Week 4', reports: 3, verified: 2, highRisk: 2 }
      ]

      const typeDistribution = [
        { name: 'Phishing', value: 4, color: '#ff4d4f' },
        { name: 'Investment', value: 4, color: '#faad14' },
        { name: 'Mobile Money', value: 1, color: '#52c41a' },
        { name: 'Romance', value: 1, color: '#722ed1' },
        { name: 'Tech Support', value: 1, color: '#13c2c2' },
        { name: 'Employment', value: 1, color: '#1890ff' },
        { name: 'Insurance', value: 2, color: '#eb2f96' },
        { name: 'Shopping', value: 1, color: '#f759ab' },
        { name: 'Identity Theft', value: 1, color: '#fadb14' },
        { name: 'Loan', value: 1, color: '#a0d911' },
        { name: 'Education', value: 1, color: '#40a9ff' }
      ]

      setStats({
        totalMonth: 18,
        verified: 12,
        pending: 5,
        highRisk: 8,
        weeklyTrend,
        typeDistribution
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

    if (selectedRisk !== 'all') {
      filtered = filtered.filter(report => report.riskLevel === selectedRisk)
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
  const riskLevels = [...new Set(reports.map(report => report.riskLevel))]

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
        <title>This Month's Reports - Ndimboni Admin</title>
      </Head>

      <div style={{ padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={2} style={{ color: '#1A5276', marginBottom: '24px' }}>
            <CalendarOutlined style={{ marginRight: '12px' }} />
            This Month's Scam Reports (June 2024)
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
                  title="Total Reports This Month"
                  value={stats.totalMonth}
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

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={14}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card title={<><BarChartOutlined /> Weekly Trend</>}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="reports" fill="#1890ff" name="Total Reports" />
                    <Bar dataKey="verified" fill="#52c41a" name="Verified" />
                    <Bar dataKey="highRisk" fill="#ff4d4f" name="High Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Col>
          <Col xs={24} lg={10}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card title={<><PieChartOutlined /> Scam Types Distribution</>}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
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
                <Select
                  style={{ width: 150 }}
                  placeholder="Select Risk Level"
                  value={selectedRisk}
                  onChange={setSelectedRisk}
                >
                  <Option value="all">All Risk Levels</Option>
                  {riskLevels.map(risk => (
                    <Option key={risk} value={risk}>{risk}</Option>
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
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card
            title="Monthly Reports"
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
                pageSize: 15,
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

export default MonthReports