class Database {
  private db: any;

  constructor() {
    this.db = new Map();
  }

  async get<T = unknown>(key: string): Promise<T> {
    return this.db.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    this.db.set(key, value);
  }
}

export const database = new Database();
