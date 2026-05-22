import React, { useState } from "react";
import { Form, Input, Button, Alert } from "antd";
import api, { getErrorMessage } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";

interface WaitlistForm {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

const WaitlistPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: WaitlistForm) => {
    setLoading(true);
    setError(null);
    try {
      await api.post(API_ENDPOINTS.waitlist, values);
      setSubmitted(true);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="waitlist-page">
      <div className="waitlist-page__inner">
        <div className="waitlist-page__badge">Coming September 1, 2026</div>
        <h1 className="waitlist-page__title">Be the first to know when we launch.</h1>
        <p className="waitlist-page__subtitle">
          HelpingHandsFund is putting the finishing touches on something great.
          Join the waitlist and we'll reach out personally when doors open.
        </p>

        {submitted ? (
          <div className="waitlist-page__success">
            <div className="waitlist-page__success-icon">✓</div>
            <h2>You're on the list!</h2>
            <p>We'll be in touch when HelpingHandsFund launches on September 1, 2026.</p>
          </div>
        ) : (
          <Form
            layout="vertical"
            onFinish={onFinish}
            className="waitlist-page__form"
            requiredMark={false}
          >
            <div className="waitlist-page__form-row">
              <Form.Item
                name="first_name"
                label="First Name"
                rules={[{ required: true, message: "Please enter your first name." }]}
              >
                <Input placeholder="Jane" size="large" />
              </Form.Item>
              <Form.Item
                name="last_name"
                label="Last Name"
                rules={[{ required: true, message: "Please enter your last name." }]}
              >
                <Input placeholder="Smith" size="large" />
              </Form.Item>
            </div>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter your email." },
                { type: "email", message: "Please enter a valid email." },
              ]}
            >
              <Input placeholder="jane@example.com" size="large" />
            </Form.Item>

            <Form.Item name="phone" label="Phone Number (optional)">
              <Input placeholder="+1 (555) 000-0000" size="large" />
            </Form.Item>

            {error && (
              <Form.Item>
                <Alert type="error" message={error} showIcon />
              </Form.Item>
            )}

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                Join the Waitlist
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default WaitlistPage;
