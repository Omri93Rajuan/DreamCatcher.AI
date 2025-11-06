export function mapMongoError(error: any): string {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0] || "Field";
        return `${field} already exists`;
    }
    if (error.name === "ValidationError") {
        return Object.values(error.errors)
            .map((e: any) => e.message)
            .join(", ");
    }
    if (error.name === "CastError") {
        return `Invalid value for field "${error.path}"`;
    }
    if (error.message) {
        return error.message;
    }
    return "Unexpected error occurred";
}
