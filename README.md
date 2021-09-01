# GrubDash
Backend Project 

Routes create, read, update, delete, and list dishes/orders for food delivery service

All middleware and handler functions have a single responsibility and are named functions.

All data passed between middleware and handler functions uses response.locals.

All chained method calls on a route(...) end with all(methodNotAllowed).

All update handlers guarantee that the id property of the stored data cannot be overwritten.
