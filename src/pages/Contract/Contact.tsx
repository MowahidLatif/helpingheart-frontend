import { useState } from "react";
import api from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { notifyError, notifySuccess } from "@/lib/notifications";
import GenericTextInput from "@/components/Form/GenericTextInput";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.contact, {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
      });
      setSubmitted(true);
      notifySuccess("Message sent. We'll get back to you soon.");
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (err) {
      notifyError(err, "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 600 }}>
        <div className="auth-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Please fill out the form below.</p>
        </div>

        {submitted && (
          <div className="text-success mb-md font-medium">
            Message sent. We'll get back to you soon.
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <GenericTextInput
                value={formData.firstName}
                name="firstName"
                placeholder="First Name"
                onChange={handleChange}
                required
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <GenericTextInput
                value={formData.lastName}
                name="lastName"
                placeholder="Last Name"
                onChange={handleChange}
                required
                hideLabel
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <GenericTextInput
              valueType="email"
              value={formData.email}
              name="email"
              placeholder="you@example.com"
              onChange={handleChange}
              required
              hideLabel
              wrapperStyle={{ marginBottom: 0 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Your Message</label>
            <textarea
              className="form-textarea"
              name="message"
              placeholder="How can we help?"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Contact;
