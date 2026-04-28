import type { Database } from './types';
export declare const supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<Database, "public", "public", {
    Tables: {
        clients: {
            Row: {
                avatar_url: string | null;
                company: string | null;
                created_at: string;
                email: string | null;
                id: string;
                name: string;
                phone: string | null;
                updated_at: string;
                user_id: string;
            };
            Insert: {
                avatar_url?: string | null;
                company?: string | null;
                created_at?: string;
                email?: string | null;
                id?: string;
                name: string;
                phone?: string | null;
                updated_at?: string;
                user_id: string;
            };
            Update: {
                avatar_url?: string | null;
                company?: string | null;
                created_at?: string;
                email?: string | null;
                id?: string;
                name?: string;
                phone?: string | null;
                updated_at?: string;
                user_id?: string;
            };
            Relationships: [];
        };
        invoice_items: {
            Row: {
                created_at: string;
                description: string;
                id: string;
                invoice_id: string;
                product_id: string | null;
                quantity: number;
                unit_price: number;
                user_id: string;
            };
            Insert: {
                created_at?: string;
                description: string;
                id?: string;
                invoice_id: string;
                product_id?: string | null;
                quantity?: number;
                unit_price?: number;
                user_id: string;
            };
            Update: {
                created_at?: string;
                description?: string;
                id?: string;
                invoice_id?: string;
                product_id?: string | null;
                quantity?: number;
                unit_price?: number;
                user_id?: string;
            };
            Relationships: [{
                foreignKeyName: "invoice_items_invoice_id_fkey";
                columns: ["invoice_id"];
                isOneToOne: false;
                referencedRelation: "invoices";
                referencedColumns: ["id"];
            }, {
                foreignKeyName: "invoice_items_product_id_fkey";
                columns: ["product_id"];
                isOneToOne: false;
                referencedRelation: "products";
                referencedColumns: ["id"];
            }];
        };
        invoices: {
            Row: {
                amount: number;
                client_id: string | null;
                created_at: string;
                id: string;
                issued_at: string;
                notes: string | null;
                number: string;
                payment_method: Database["public"]["Enums"]["payment_method"];
                status: Database["public"]["Enums"]["invoice_status"];
                updated_at: string;
                user_id: string;
            };
            Insert: {
                amount?: number;
                client_id?: string | null;
                created_at?: string;
                id?: string;
                issued_at?: string;
                notes?: string | null;
                number: string;
                payment_method?: Database["public"]["Enums"]["payment_method"];
                status?: Database["public"]["Enums"]["invoice_status"];
                updated_at?: string;
                user_id: string;
            };
            Update: {
                amount?: number;
                client_id?: string | null;
                created_at?: string;
                id?: string;
                issued_at?: string;
                notes?: string | null;
                number?: string;
                payment_method?: Database["public"]["Enums"]["payment_method"];
                status?: Database["public"]["Enums"]["invoice_status"];
                updated_at?: string;
                user_id?: string;
            };
            Relationships: [{
                foreignKeyName: "invoices_client_id_fkey";
                columns: ["client_id"];
                isOneToOne: false;
                referencedRelation: "clients";
                referencedColumns: ["id"];
            }];
        };
        products: {
            Row: {
                created_at: string;
                description: string | null;
                id: string;
                name: string;
                price: number;
                sku: string | null;
                stock: number;
                updated_at: string;
                user_id: string;
            };
            Insert: {
                created_at?: string;
                description?: string | null;
                id?: string;
                name: string;
                price?: number;
                sku?: string | null;
                stock?: number;
                updated_at?: string;
                user_id: string;
            };
            Update: {
                created_at?: string;
                description?: string | null;
                id?: string;
                name?: string;
                price?: number;
                sku?: string | null;
                stock?: number;
                updated_at?: string;
                user_id?: string;
            };
            Relationships: [];
        };
        profiles: {
            Row: {
                avatar_url: string | null;
                created_at: string;
                email: string | null;
                full_name: string | null;
                id: string;
                updated_at: string;
            };
            Insert: {
                avatar_url?: string | null;
                created_at?: string;
                email?: string | null;
                full_name?: string | null;
                id: string;
                updated_at?: string;
            };
            Update: {
                avatar_url?: string | null;
                created_at?: string;
                email?: string | null;
                full_name?: string | null;
                id?: string;
                updated_at?: string;
            };
            Relationships: [];
        };
        stock_movements: {
            Row: {
                created_at: string;
                id: string;
                movement_type: Database["public"]["Enums"]["stock_movement_type"];
                note: string | null;
                product_id: string;
                quantity: number;
                user_id: string;
            };
            Insert: {
                created_at?: string;
                id?: string;
                movement_type: Database["public"]["Enums"]["stock_movement_type"];
                note?: string | null;
                product_id: string;
                quantity: number;
                user_id: string;
            };
            Update: {
                created_at?: string;
                id?: string;
                movement_type?: Database["public"]["Enums"]["stock_movement_type"];
                note?: string | null;
                product_id?: string;
                quantity?: number;
                user_id?: string;
            };
            Relationships: [{
                foreignKeyName: "stock_movements_product_id_fkey";
                columns: ["product_id"];
                isOneToOne: false;
                referencedRelation: "products";
                referencedColumns: ["id"];
            }];
        };
    };
    Views: { [_ in never]: never; };
    Functions: { [_ in never]: never; };
    Enums: {
        invoice_status: "active" | "archived" | "draft" | "paid" | "overdue";
        payment_method: "master" | "visa" | "stripe" | "paypal" | "wise" | "american_express" | "cash" | "transfer";
        stock_movement_type: "in" | "out" | "adjust";
    };
    CompositeTypes: { [_ in never]: never; };
}, {
    PostgrestVersion: "14.5";
}>;
