// =============================================================================
// Example: How to Use the SCSS Library in Your Components
// =============================================================================
// This file shows practical examples of integrating the new SCSS system

// Example 1: Using in main.tsx or App.tsx
// -----------------------------------------------------------------------------
import React from 'react';
import './styles/main.scss';  // ← Import global styles once here

function App() {
  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
}

// Example 2: Using Utility Classes in JSX
// -----------------------------------------------------------------------------
function DashboardWithUtilities() {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <nav className="sidebar-nav">
          <a href="#" className="sidebar-nav-item active">
            Dashboard
          </a>
          <a href="#" className="sidebar-nav-item">
            Campaigns
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="dashboard-main">
        {/* Header with utility classes */}
        <div className="mb-xl">
          <h1 className="text-primary mb-sm">Welcome Back!</h1>
          <p className="text-muted">Here's your campaign overview</p>
        </div>

        {/* Stats grid */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-label">Total Raised</div>
            <div className="stat-value">$12,345</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Campaigns</div>
            <div className="stat-value">8</div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Example 3: Component with CSS Module
// -----------------------------------------------------------------------------
// File: Button.module.scss
/*
@use '../styles/abstracts' as *;

.customButton {
  @include button-base;
  background-color: $color-primary;
  color: white;
  
  &:hover {
    background-color: $color-primary-dark;
  }
  
  @include respond-below(mobile) {
    width: 100%;
    font-size: $font-size-sm;
  }
}

.outline {
  @include button-base;
  background-color: transparent;
  border: 2px solid $color-primary;
  color: $color-primary;
  
  &:hover {
    background-color: $color-primary;
    color: white;
  }
}
*/

// File: Button.tsx
import React from 'react';
import styles from './Button.module.scss';

interface ButtonProps {
  variant?: 'filled' | 'outline';
  children: React.ReactNode;
  onClick?: () => void;
}

function CustomButton({ variant = 'filled', children, onClick }: ButtonProps) {
  const className = variant === 'outline' ? styles.outline : styles.customButton;
  
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  );
}

// Example 4: Auth Page with Pre-built Classes
// -----------------------------------------------------------------------------
function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Sign In</h1>
          <p>Welcome back to the platform</p>
        </div>

        <form className="auth-form">
          <div className="form-group">
            <label className="form-label required">Email</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="you@example.com"
            />
            <span className="form-help-text">
              We'll never share your email
            </span>
          </div>

          <div className="form-group">
            <label className="form-label required">Password</label>
            <input 
              type="password" 
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-block">
              Sign In
            </button>
            <button type="button" className="btn btn-outline">
              Sign Up
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}

// Example 5: Campaign List with Grid
// -----------------------------------------------------------------------------
function CampaignList({ campaigns }: { campaigns: any[] }) {
  return (
    <div className="container py-lg">
      <div className="mb-xl">
        <h2 className="text-center text-primary">Our Campaigns</h2>
        <p className="text-center text-muted">
          Support causes that matter
        </p>
      </div>

      <div className="campaign-list">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="campaign-card">
            <img 
              src={campaign.image} 
              alt={campaign.title}
              className="campaign-image"
            />
            <h3 className="campaign-title">{campaign.title}</h3>
            <p className="text-muted mb-md">{campaign.description}</p>
            <div className="campaign-stats">
              <span className="text-success font-bold">
                ${campaign.raised}
              </span>
              <span className="text-muted">
                of ${campaign.goal}
              </span>
            </div>
            <button className="btn btn-primary w-full mt-md">
              Donate Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example 6: Modal Dialog
// -----------------------------------------------------------------------------
function ConfirmModal({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Confirm Action</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>Are you sure you want to proceed with this action?</p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Example 7: Responsive Table
// -----------------------------------------------------------------------------
function DonationsTable({ donations }: any) {
  return (
    <div className="container">
      <h2 className="mb-lg">Recent Donations</h2>
      
      <div className="table-container">
        <table className="table table-responsive">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Amount</th>
              <th>Campaign</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation: any) => (
              <tr key={donation.id}>
                <td data-label="Donor">{donation.donor}</td>
                <td data-label="Amount">${donation.amount}</td>
                <td data-label="Campaign">{donation.campaign}</td>
                <td data-label="Date">{donation.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Example 8: Form with Validation
// -----------------------------------------------------------------------------
function CreateCampaignForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  return (
    <div className="container py-xl">
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="card-header">
          <h2>Create New Campaign</h2>
        </div>

        <div className="card-body">
          <form>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label required">Campaign Title</label>
                <input 
                  type="text" 
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="e.g., Help Build a School"
                />
                {errors.title && (
                  <span className="form-error">{errors.title}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label required">Goal Amount</label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="10000"
                />
                <span className="form-help-text">
                  Set a fundraising goal
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label required">Description</label>
              <textarea 
                className="form-textarea"
                placeholder="Tell people about your campaign..."
                rows={5}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Create Campaign
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Example 9: Mixing Utilities with Custom Styles
// -----------------------------------------------------------------------------
function MixedExample() {
  return (
    <div className="container">
      {/* Use utilities for quick styling */}
      <div className="flex-between mb-lg">
        <h1 className="text-primary">Dashboard</h1>
        <button className="btn btn-primary">
          New Campaign
        </button>
      </div>

      {/* Grid with responsive behavior */}
      <div className="grid grid-cols-3 gap-lg mb-xl">
        <div className="card p-lg shadow-md">
          <h3 className="text-center mb-md">Card 1</h3>
          <p className="text-muted text-center">Content here</p>
        </div>
        <div className="card p-lg shadow-md">
          <h3 className="text-center mb-md">Card 2</h3>
          <p className="text-muted text-center">Content here</p>
        </div>
        <div className="card p-lg shadow-md">
          <h3 className="text-center mb-md">Card 3</h3>
          <p className="text-muted text-center">Content here</p>
        </div>
      </div>

      {/* Custom component with module styles */}
      <div className="section">
        <CustomButton variant="filled">Primary Action</CustomButton>
        <CustomButton variant="outline">Secondary Action</CustomButton>
      </div>
    </div>
  );
}

export {
  DashboardWithUtilities,
  CustomButton,
  SignInPage,
  CampaignList,
  ConfirmModal,
  DonationsTable,
  CreateCampaignForm,
  MixedExample,
};
