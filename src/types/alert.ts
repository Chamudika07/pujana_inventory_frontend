export interface LowStockAlert {
  id: number;
  item_id: number;
  user_id: number;
  quantity_at_alert: number;
  alert_type: string;
  is_resolved: boolean;
  created_at: string;
  last_sent_at?: string;
  next_alert_at?: string;
  item: {
    id: number;
    name: string;
    model_number: string;
    quantity: number;
  };
}

export interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  resolved_alerts: number;
  low_stock_items: number;
}

export interface UserPreferencesUpdate {
  phone_number?: string;
  notification_enabled?: boolean;
  alert_threshold?: number;
  notification_email?: string;
}

export interface UserPreferences {
  notification_email: string;
  phone_number: string;
  notification_enabled: boolean;
  alert_threshold: number;
}
