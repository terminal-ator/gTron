import  { gql } from 'apollo-server';

export default  gql`

    type Journal{
        id: Int
        date: String
        narration: String
        refno: String
        type: String
        sttmt_id: String
    }

    type Posting{
        id:Int
        master: Master
        amount: Float
    }

    type Master{
        id: Int
        name: String
        balance: Int
        accounts: [Account]
        group: Group
    }

    type Account{
        id: Int
        name: String
    }

    type Beat{
        id: Int
        name: String
    }

    type Group{
        id: Int
        name: String
    }

    input CreateMasterInput{
        companyID: Int
        beatID: Int
        groupID: Int
        name: String
    }

    type Company{
        id: Int
        name: String
        journal: [Journal]
        masters:[Master]
        beats: [Beat]
        groups: [Group]
    }

    type Query{
        getCompanies: [Company]
        getCompany(id: Int): Company!
    }

    type Mutation{
        createMaster(input: CreateMasterInput): Master
    }
`