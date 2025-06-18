export type ICreateAccount = {
     name: string;
     email: string;
     otp: number;
};

export type IResetPassword = {
     email: string;
     otp: number;
};
// export type IContact = {
//   name: string;
//   email: string;
//   message: string;
//   subject: string;
// };
export type IContact = {
     name: string;
     email: string;
     message: string;
     address: string;
     phone: string;
};
export interface IResetPasswordByEmail {
     email: string;
     resetUrl: string;
}
