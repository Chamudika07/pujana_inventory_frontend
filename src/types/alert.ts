export interface LowStockAlert {
  id: number;
  item_id: number;
  user_id: number;
  quantity_at_alert: number;
  alert_threshold: number;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
}

export interface AlertStats {
  total_alerts: number;
  active_alerts: number;
  resolved_alerts: number;
  low_stock_items: number;
}

export interface UserPreferencesUpdate {
  notification_enabled?: boolean;
  alert_threshold?: number;
  notification_email?: string;
}
