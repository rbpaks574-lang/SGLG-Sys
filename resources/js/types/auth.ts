export type User = {
    id: number;
    name: string;
    username?: string;
    email: string;
    phone?: string;
    role?: 'admin' | 'checker' | 'barangay' | string;
    barangay_id?: number | null;
    barangay?: {
        id: number;
        name: string;
        code: string;
        captain_name?: string;
        contact_number?: string;
        pollution_status?: string;
    } | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    is_active?: boolean;
    last_login_at?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
