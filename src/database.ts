import SQLDataSource from './DataSource';
import { CreateInput } from './resolvers';
class GoDatabase extends SQLDataSource{
    
    getCompanies(){
        return this.knex.select("*").from("company")
    }

    async getCompanyById(id:number){
        console.log({ id })
        const res  = await this.knex.select("*").from("company").where({ id: id }).first()
        console.log({ res })
        return res
    }

    getMasters(id: number){
        return this.knex.select("*").from("account_master").where({companyid:id})
    }

    getAccountsForMasterID(id: number){
        return this.knex.select("*").from("accounts").where({ masterid: id})
    }

    getBeatForCompany(id: number){
        return this.knex.select("*").from("beat").where({ companyid: id})
    }

    getGroupsForCompany(){
        return this.knex.select("*").from("master_groups")
    }

    async createMaster(input:CreateInput){

        const res =await this.knex.transaction(async (trx)=>{
            let Mid;
            await trx("account_master").insert({name: input.name, cust_id:9999,
            chq_flg:1,beatid:input.beatID,groupid: input.groupID, companyid: input.companyID}).returning("id").then(async (id)=>{
                await trx("accounts").insert({
                name: input.name,
                ismaster: 1,
                interfacecode: "CREATE",
                masterid: id[0]
                });
                Mid = id[0];
            })
        
            
            return this.knex.select("*").from("account_master").where({ id: Mid})

        }
        ).catch(err=>{
            console.log(`Error while creating master: ${err} `)
        })
    console.log(res);   
     return res;   
    }
}

export default GoDatabase;