import Knex from 'knex';
import { DataSource, DataSourceConfig}from 'apollo-datasource';
import { KeyValueCache, InMemoryLRUCache } from 'apollo-server-caching';

class SQLDataSource<T = any> extends DataSource{
    
    context : T;
    cache: KeyValueCache;
    db: Knex;
    knex: Knex;
    constructor(knexConfig: Knex.Config){
        super();
        this.context
        this.cache;
        this.db = Knex(knexConfig)
        this.knex = this.db;

        // const _this=this;
    }

    initialize(config: DataSourceConfig<T>){
        this.context = config.context
        this.cache = config.cache || new InMemoryLRUCache;
    }


}

export default SQLDataSource;