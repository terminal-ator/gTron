import GoDatabase from '../database';

interface Context {
  dataSources: {
    db: GoDatabase;
  };
}

interface input {
  input: CreateInput;
}
export interface CreateInput {
  companyID: number;
  beatID: number;
  groupID: number;
  name: string;
}

const resolver = {
  Query: {
    getCompanies: (_parent, _arg, context: Context, _info) => {
      return context.dataSources.db.getCompanies();
    },
    getCompany: async (_parent, { id }, context: Context, _info) => {
      const result = await context.dataSources.db.getCompanyById(id);
      console.log({ result });
      return result;
    },
    getErrors: async (_parent, { companyID }, context: Context, _info) => {
      const result = await context.dataSources.db.fetchErrors(companyID);
      return result;
    },
  },
  Mutation: {
    createMaster: (_parent, arg: input, context: Context, _info) => {
      console.log({ arg });
      return context.dataSources.db.createMaster(arg.input);
    },
    mergeMaster: (
      _parent,
      { input: { custID, errorID } },
      context: Context,
      _info,
    ) => {
      context.dataSources.db.mergeErrors(custID, errorID);
      return { code: 200, message : 'Request fulfilled'}
    },
  },
  Company: {
    masters: (parent, _arg, context: Context, _info) => {
      return context.dataSources.db.getMasters(parent.id);
    },
    beats: (parent, _arg, context: Context) => {
      return context.dataSources.db.getBeatForCompany(parent.id);
    },
    groups: (_parent, _arg, context: Context) => {
      return context.dataSources.db.getGroupsForCompany();
    },
  },

  Master: {
    accounts: (parent, _arg, context: Context, _info) => {
      return context.dataSources.db.getAccountsForMasterID(parent.id);
    },
  },
};

export default resolver;
