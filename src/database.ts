import SQLDataSource from './DataSource';
import { CreateInput } from './resolvers';

interface Entry {
  custID: number;
  amount: number;
}

interface Journal {
  date: string;
  narration: string;
  refno: string;
  company_id: number;
  type: string;
  sttmt_id?: number;
  creditEntries: Entry[];
  debitEntries: Entry[];
}

class GoDatabase extends SQLDataSource {
  getCompanies() {
    return this.knex.select('*').from('company');
  }

  async getCompanyById(id: number) {
    console.log({ id });
    const res = await this.knex
      .select('*')
      .from('company')
      .where({ id: id })
      .first();
    console.log({ res });
    return res;
  }

  getMasters(id: number) {
    return this.knex
      .select('*')
      .from('account_master')
      .where({ companyid: id });
  }

  getAccountsForMasterID(id: number) {
    return this.knex
      .select('*')
      .from('accounts')
      .where({ masterid: id });
  }

  getBeatForCompany(id: number) {
    return this.knex
      .select('*')
      .from('beat')
      .where({ companyid: id });
  }

  getGroupsForCompany() {
    return this.knex.select('*').from('master_groups');
  }

  async createMaster(input: CreateInput) {
    const res = await this.knex
      .transaction(async trx => {
        let Mid;
        await trx('account_master')
          .insert({
            name: input.name,
            cust_id: 9999,
            chq_flg: 1,
            beatid: input.beatID,
            groupid: input.groupID,
            companyid: input.companyID,
          })
          .returning('id')
          .then(async id => {
            await trx('accounts').insert({
              name: input.name,
              ismaster: 1,
              interfacecode: 'CREATE',
              masterid: id[0],
            });
            Mid = id[0];
          });

        return this.knex
          .select('*')
          .from('account_master')
          .where({ id: Mid });
      })
      .catch(err => {
        console.log(`Error while creating master: ${err} `);
      });
    console.log(res);
    return res;
  }
  fetchErrors(companyID: number) {
    return this.knex
      .select(
        'id',
        'master_name',
        'ledger_type',
        'ledger_date',
        'ledger_no',
        'associated_id',
        'to_customer',
        'company_id',
        'interfacecode',
      )
      .from('error_ledger')
      .where({ company_id: companyID });
  }

  mergeErrors(custID: number, errorID: number) {
    // create transaction
    this.knex
      .transaction(async trx => {
        // create a new account with the name and interface code
        const account = await trx('error_ledger')
          .select(
            'master_name',
            'interfacecode',
            'associated_id',
            'to_customer',
            'ledger_no',
            'company_id',
            'ledger_date',
          )
          .from('error_ledger')
          .where({ id: errorID })
          .first();
        await trx('accounts').insert({
          name: account.master_name,
          interfacecode: account.interfacecode,
          masterid: custID,
        });
        // move error transaction to ledger
        const debit: Entry = {
          custID: account.associated_id,
          amount: -account.to_customer,
        };

        const credit: Entry = { custID: custID, amount: account.to_customer };
        const jrnl: Journal = {
          debitEntries: [debit],
          creditEntries: [credit],
          narration: 'Sales',
          refno: account.ledger_no,
          company_id: account.company_id,
          date: account.ledger_date,
          type: 'Bill',
        };
        // console.log({jrnl})
        await this.createDoubleEntry(jrnl);
      })
      .catch(err => {
        console.log(`Error while executing ${err}`);
      });
  }

  async createDoubleEntry(jrnl: Journal) {
    // create a knex transaction
    await this.knex
      .transaction(async trx => {
        // create a journal entry
        let jID: any[];
        try {
          jID = await trx('journal')
            .insert({
              date: jrnl.date,
              narration: jrnl.narration,
              refno: jrnl.refno,
              company_id: jrnl.company_id,
              type: jrnl.type,
              sttmt_id: jrnl.sttmt_id,
            })
            .returning('id');
        } catch (err) {
          console.log(`Error while creating journal entry: ${err}`);
        }

        // creating debit entries
        jrnl.debitEntries.forEach(async j => {
          try {
            await trx('posting').insert({
              masterid: j.custID,
              journalid: jID[0],
              asset_type: 'Rs.',
              amount: -j.amount,
              company_id: jrnl.company_id,
            });
          } catch (err) {
            console.log(`Error while creating posting for debit: ${err}`);
            trx.rollback();
          }
        });
        jrnl.creditEntries.forEach(async j => {
          try {
            await trx('posting').insert({
              masterid: j.custID,
              journalid: jID[0],
              asset_type: 'Rs.',
              amount: j.amount,
              company_id: jrnl.company_id,
            });
          } catch (err) {
            console.log(`Error while creating posting for credit: ${err}`);
            trx.rollback();
          }
        });
      })
      .catch(err => {
        console.log(`Error while processing: ${err}`);
      });
  }
}

export default GoDatabase;
