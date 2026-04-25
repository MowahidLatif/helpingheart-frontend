import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#111111",
    colorSuccess: "#16a34a",
    colorWarning: "#ffc107",
    colorError: "#dc3545",
    colorInfo: "#17a2b8",
    colorText: "#212529",
    colorTextSecondary: "#6c757d",
    colorBgBase: "#ffffff",
    colorBorder: "#dee2e6",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    borderRadius: 8,
  },
  components: {
    Button: {
      colorPrimary: "#111111",
      colorPrimaryHover: "#ffffff",
      colorPrimaryActive: "#111111",
      primaryColor: "#ffffff",
      primaryShadow: "none",
      defaultBg: "#ffffff",
      defaultColor: "#111111",
      defaultBorderColor: "#111111",
      defaultHoverBg: "#111111",
      defaultHoverColor: "#ffffff",
      defaultHoverBorderColor: "#111111",
      defaultActiveBg: "#111111",
      defaultActiveColor: "#ffffff",
      defaultActiveBorderColor: "#111111",
    },
  },
};
