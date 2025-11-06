import bcrypt from "bcrypt";
const hashPassword = (password: string) => {
    return bcrypt.hashSync(password, 10);
};
const comparePassword = (password: string, anotherPassword: string) => {
    return bcrypt.compareSync(password, anotherPassword);
};
export { hashPassword, comparePassword };
