// pages/admin/reports/today.js
import Head from 'next/head'
import AdminLayout from '../../../components/Admin/AdminLayout'
import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Typography, Row, Col, Statistic, message, Modal, Descriptions } from 'antd'
import { FileTextOutlined, EyeOutlined, CalendarOutlined, TrophyOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'

const { Title, Text } = Typography

function TodayReports() {
  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [stats, setStats] = useState({
    totalToday: 0,
    verified: 0,
    pending: 0,
    highRisk: 0
  })

  useEffect(() => {
    fetchTodayReports()
    fetchStats()
  }, [])

  const fetchTodayReports = async () => {
    try {
      setLoading(true)
      // Replace with actual API call
      const mockData = [
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
        {
          key: 3,
          title: 'Romance Scammer Profile',
          type: 'Romance',
          url: 'Dating App Profile',
          description: 'Fake dating profile using stolen military photos',
          reporterName: 'Sarah Nyirahabimana',
          reporterEmail: 'sarah.n@example.com',
          timeReported: '2024-06-18 12:45:00',
          status: 'Investigating',
          riskLevel: 'Medium',
          evidence: 'Profile screenshots and chat logs'
        },
        {
          key: 4,
          title: 'Tech Support Scam Call',
          type: 'Tech Support',
          url: '+250788999777',
          description: 'Caller claiming to be from Microsoft tech support',
          reporterName: 'David Nkurunziza',
          reporterEmail: 'david.n@example.com',
          timeReported: '2024-06-18 11:20:00',
          status: 'Verified',
          riskLevel: 'High',
          evidence: 'Call recording'
        },
        {
          key: 5,
          title: 'Cryptocurrency Scam',
          type: 'Investment',
          url: 'https://crypto-profits-rw.com',
          description: 'Website promoting fake cryptocurrency investment scheme',
          reporterName: 'Grace Mukamana',
          reporterEmail: 'grace.m@example.com',
          timeReported: '2024-06-18 10:15:00',
          status: 'Pending',
          riskLevel: 'High',
          evidence: 'Website screenshots and transaction records'
        },
        {
          key: 6,
          title: 'Fake Lottery Winner SMS',
          type: 'Lottery',
          url: '+250788123456',
          description: 'SMS claiming winner of MTN lottery, requesting processing fee',
          reporterName: 'Eric Habimana',
          reporterEmail: 'eric.h@example.com',
          timeReported: '2024-06-18 09:30:00',
          status: 'Verified',
          riskLevel: 'Medium',
          evidence: 'SMS screenshots'
        }
      ]
      
      setReports(mockData)
      setLoading(false)
    } catch (error) {
      message.error('Failed to fetch today\'s reports')
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Replace with actual API call
      setStats({
        totalToday: 6,
        verified: 3,
        pending: 2,
        highRisk: 3
      })
    } catch (error) {
      message.error('Failed to fetch statistics')
    }
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
      title: 'Time Reported',
      dataIndex: 'timeReported',
      key: 'timeReported',
      render: (time) => new Date(time).toLocaleTimeString()
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
        <title>Today's Reports - Ndimboni Admin</title>
      </Head>

      <div style={{ padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={2} style={{ color: '#1A5276', marginBottom: '24px' }}>
            <CalendarOutlined style={{ marginRight: '12px' }} />
            Today's Scam Reports
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
                  title="Total Reports Today"
                  value={stats.totalToday}
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

        {/* Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card
            title="Today's Reports"
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
              dataSource={reports}
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

export default TodayReports