import { identity } from './identity';
import { uuid as uuidv4 } from './uuid';

export class base {
  public id?: string;
  public created_date?: number;
  public created_by?: string;
  public modified_date?: number;
  public modified_by?: string;
  public description?: string;

  public deleted?: boolean;
  public deleted_date?: number;
  constructor() {
    this.id = uuidv4();
    this.created_date = new Date().getTime();
    this.created_by = identity.id;
  }
}