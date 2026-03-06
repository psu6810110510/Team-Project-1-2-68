export class AuthResponseDto {
  access_token: string;
  user: {
    id: string; // หรือ number
    email: string;
    full_name: string;
    role: string;
    phone?: string;
    image?: string;
    description?: string;
  };
}
