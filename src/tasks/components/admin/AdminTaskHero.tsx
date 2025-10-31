import React from "react";
import { Card, Col, Row, Space, Typography } from "antd";
import { ClipboardList, Clock4, CheckCircle2 } from "lucide-react";

interface AdminTaskHeroProps {
  total: number;
  overdue: number;
  completed: number;
}

export const AdminTaskHero: React.FC<AdminTaskHeroProps> = ({ total, overdue, completed }) => {
  return (
    <div className="rounded-xl bg-gradient-to-r from-[#1f7dc8] via-[#6758f3] to-[#1f7dc8] p-6 text-white shadow-sm">
      <Space direction="vertical" size={6}>
        <Typography.Text className="text-xs uppercase tracking-widest text-white/80">
          Operations dashboard
        </Typography.Text>
        <Typography.Title level={3} className="!mb-0 !text-white">
          Team tasks overview
        </Typography.Title>
        <Typography.Text className="!text-white/80">
          Assign work, keep deadlines visible, and close loops faster across every relationship manager.
        </Typography.Text>
      </Space>

      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Space direction="vertical" size={4}>
              <Space align="center" size={6}>
                <ClipboardList size={16} className="text-[#1f7dc8]" />
                <Typography.Text type="secondary">Total</Typography.Text>
              </Space>
              <Typography.Title level={3} className="!m-0">
                {total}
              </Typography.Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Space direction="vertical" size={4}>
              <Space align="center" size={6}>
                <Clock4 size={16} className="text-rose-500" />
                <Typography.Text type="secondary">Overdue</Typography.Text>
              </Space>
              <Typography.Title level={3} className="!m-0 text-rose-500">
                {overdue}
              </Typography.Title>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} className="shadow-sm">
            <Space direction="vertical" size={4}>
              <Space align="center" size={6}>
                <CheckCircle2 size={16} className="text-emerald-500" />
                <Typography.Text type="secondary">Completed</Typography.Text>
              </Space>
              <Typography.Title level={3} className="!m-0 text-emerald-500">
                {completed}
              </Typography.Title>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
