import { gql } from 'apollo-server';

export default gql`
  type Journal {
    id: Int
    date: String
    narration: String
    refno: String
    type: String
    sttmt_id: String
  }

  type Posting {
    id: Int
    master: Master
    amount: Float
  }

  type Master {
    id: Int
    name: String
    balance: Int
    accounts: [Account]
    group: Group
  }

  type Account {
    id: Int
    name: String
  }

  type Beat {
    id: Int
    name: String
  }

  type Group {
    id: Int
    name: String
  }

  input CreateMasterInput {
    companyID: Int
    beatID: Int
    groupID: Int
    name: String
  }

  input MergeMasterInput {
    custID: Int
    errorID: Int
  }

  type GeneralResponse {
    code: Int
    message: String
  }

  type Company {
    id: Int
    name: String
    journal: [Journal]
    masters: [Master]
    beats: [Beat]
    groups: [Group]
  }

  type Error {
    id: Int!
    master_name: String
    ledger_type: String
    ledger_date: String
    ledger_no: String
    associated_id: Int
    to_customer: Float
    company_id: Int
    interfacecode: String
  }

  type Query {
    getCompanies: [Company]
    getCompany(id: Int): Company!
    getErrors(companyID: Int): [Error]
  }

  type Mutation {
    createMaster(input: CreateMasterInput): Master
    mergeMaster(input: MergeMasterInput): GeneralResponse!
  }
`;
