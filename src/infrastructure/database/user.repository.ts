import type {
  UserRepository,
  CreateUserData,
} from '../../application/repositories/user.repository.js';
import type { User } from '../../domain/entities/user.js';
import type { PostgresClient } from './postgres.client.js';

const mapUser = (row: Record<string, unknown>): User => ({
  id: row.id as string,
  email: row.email as string,
  passwordHash: row.password_hash as string,
  firstName: row.first_name as string,
  lastName: row.last_name as string,
  roles: (row.roles as string[] | undefined) ?? [],
  createdAt: row.created_at as Date,
  updatedAt: row.updated_at as Date,
});

export class PostgresUserRepository implements UserRepository {
  public constructor(private readonly database: PostgresClient) {}
  public async findByEmail(email: string): Promise<User | null> {
    const result = await this.database.pool.query(
      `SELECT u.*, COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
       FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.email = $1 GROUP BY u.id`,
      [email],
    );
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }
  public async findById(id: string): Promise<User | null> {
    const result = await this.database.pool.query(
      `SELECT u.*, COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS roles
       FROM users u LEFT JOIN user_roles ur ON ur.user_id = u.id LEFT JOIN roles r ON r.id = ur.role_id
       WHERE u.id = $1 GROUP BY u.id`,
      [id],
    );
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }
  public async create(data: CreateUserData): Promise<User> {
    const result = await this.database.pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.email, data.passwordHash, data.firstName, data.lastName],
    );
    return mapUser({ ...result.rows[0], roles: [] });
  }
}
