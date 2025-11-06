# Data Layer Patterns

## Overview

The data layer handles how your application persists, queries, and manages data. This is one of the most critical architectural decisions as it affects performance, type safety, developer experience, and scalability.

## Key Considerations

### Type Safety
- **Strong Typing**: Catch errors at compile time, enable autocomplete
- **Schema Validation**: Runtime validation of data shapes
- **Type Generation**: Automatically generate types from schema/database
- **Migration Safety**: Type-safe migrations prevent production errors

### Developer Experience
- **Query API**: SQL-like vs fluent API vs query builders
- **Tooling**: IDE support, debugging, migration tools
- **Learning Curve**: Team familiarity, documentation quality
- **Local Development**: Easy setup, seeding, testing

### Performance
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: N+1 prevention, eager loading, query analysis
- **Caching Strategy**: Application-level vs database-level caching
- **Edge Compatibility**: Works with edge runtimes (Cloudflare, Vercel)

### Scalability
- **Horizontal Scaling**: Multiple database instances
- **Sharding Support**: Data distribution across nodes
- **Read Replicas**: Separate read/write databases
- **Serverless Compatibility**: Cold start performance, connection limits

## Common Approaches

### Traditional ORMs
**Philosophy**: Object-oriented abstraction over databases

**Characteristics**:
- Rich model layer with methods and relationships
- Active Record or Data Mapper patterns
- Heavy abstraction from SQL
- Built-in migrations, seeds, validation

**When to Choose**:
- Complex domain models with business logic
- Team prefers OOP patterns
- Need full-featured ORM capabilities
- Long-running server processes

**Tradeoffs**:
- ➕ Comprehensive feature set
- ➕ Mature ecosystem and community
- ➖ Learning curve for advanced features
- ➖ Can be opinionated about patterns
- ➖ May not work well in serverless/edge

**Examples**: TypeORM, Sequelize, Mongoose

### Type-Safe Query Builders
**Philosophy**: Type-safe SQL with minimal abstraction

**Characteristics**:
- Direct SQL control with TypeScript types
- Composable query building
- Automatic type inference from schema
- Lightweight runtime

**When to Choose**:
- Need fine-grained SQL control
- Performance is critical
- Want strong typing without heavy ORM
- Edge/serverless deployment

**Tradeoffs**:
- ➕ Excellent type safety and autocomplete
- ➕ Predictable performance (you write SQL)
- ➕ Lightweight, edge-compatible
- ➖ More verbose than ORMs
- ➖ Less built-in functionality
- ➖ Manual relationship management

**Examples**: Kysely, Drizzle ORM (query builder mode)

### Schema-First ORMs
**Philosophy**: Define schema, generate everything else

**Characteristics**:
- Declarative schema definition
- Type generation and client generation
- Migration system built-in
- Rich query API with type inference

**When to Choose**:
- Greenfield projects
- Want comprehensive tooling
- Team values DX and type safety
- Need visual database tools

**Tradeoffs**:
- ➕ Excellent developer experience
- ➕ Best-in-class type safety
- ➕ Great tooling (Studio, migrations)
- ➕ Prevents many common errors
- ➖ Another abstraction layer to learn
- ➖ Can be opinionated about workflow
- ➖ Vendor-specific features

**Examples**: Prisma, Drizzle ORM (schema mode)

### Direct Database Clients
**Philosophy**: Raw SQL with minimal abstraction

**Characteristics**:
- Direct SQL queries
- Maximum control and flexibility
- No ORM layer
- Manual type definitions

**When to Choose**:
- Complex SQL requirements
- Existing database with complex schema
- Team has strong SQL expertise
- Maximum performance needed

**Tradeoffs**:
- ➕ Complete control over queries
- ➕ No abstraction overhead
- ➕ Works with any database feature
- ➖ No type safety without manual work
- ➖ More boilerplate code
- ➖ Manual relationship handling
- ➖ More room for SQL injection

**Examples**: node-postgres (pg), mysql2, better-sqlite3

### Edge-Compatible Solutions
**Philosophy**: Work in edge environments with connection limits

**Characteristics**:
- HTTP-based or connection pooling
- Serverless/edge runtime compatible
- Low cold start overhead
- Often include caching layer

**When to Choose**:
- Deploying to edge (Cloudflare Workers, Vercel Edge)
- Need global low latency
- Serverless deployment
- Small payload size critical

**Tradeoffs**:
- ➕ Works in edge environments
- ➕ Fast cold starts
- ➕ Global distribution
- ➖ Different connection model
- ➖ May have feature limitations
- ➖ Different pricing model

**Examples**: PlanetScale (HTTP), Turso, Neon (serverless), Supabase (HTTP)

## Decision Framework

### Questions to Ask

1. **Deployment Target**
   - Traditional server? → Any ORM works
   - Serverless? → Check connection pooling
   - Edge? → Need edge-compatible solution

2. **Team Experience**
   - SQL experts? → Query builder or raw SQL
   - Prefer abstractions? → Traditional ORM
   - TypeScript heavy? → Type-safe options

3. **Project Complexity**
   - Simple CRUD? → Any approach works
   - Complex relationships? → ORM may help
   - Custom SQL needs? → Query builder or raw

4. **Type Safety Needs**
   - Critical? → Prisma, Drizzle, Kysely
   - Nice to have? → Any with TypeScript support
   - Not important? → Any approach

5. **Performance Requirements**
   - High throughput? → Query builder or raw SQL
   - Standard? → Any approach works
   - Edge latency? → Edge-compatible solution

6. **Migration Strategy**
   - Schema-first? → Prisma, Drizzle
   - Database-first? → Query builders
   - Manual control? → Raw SQL + migration tool

## Implementation Patterns

### Repository Pattern
Encapsulate data access logic:

```typescript
// Abstract data layer behind interfaces
interface UserRepository {
  findById(id: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
}

// Implement with chosen data layer
class PrismaUserRepository implements UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }
  // ...
}
```

**Benefits**: Easy to test, swap implementations, mock for testing

### Query Object Pattern
Build reusable, composable queries:

```typescript
// Create query builders for common patterns
const activeUsersQuery = db
  .selectFrom('users')
  .where('active', '=', true)
  .where('deletedAt', 'is', null)

// Compose queries
const premiumActiveUsers = activeUsersQuery
  .where('tier', '=', 'premium')
```

**Benefits**: DRY queries, testable logic, type safety

### Unit of Work Pattern
Manage transactions and consistency:

```typescript
// Group related operations in transaction
async function createOrderWithItems(orderData, items) {
  return await db.transaction(async (tx) => {
    const order = await tx.order.create(orderData)
    const orderItems = await tx.orderItem.createMany(
      items.map(item => ({ ...item, orderId: order.id }))
    )
    await tx.inventory.decrementMany(items)
    return { order, orderItems }
  })
}
```

**Benefits**: Consistency, atomicity, easier error handling

## Common Pitfalls

1. **N+1 Queries**: Loading related data in loops
   - **Solution**: Eager loading, dataloader pattern, batch queries

2. **Missing Indexes**: Slow queries on filtered columns
   - **Solution**: Add indexes on frequently queried fields

3. **Connection Exhaustion**: Too many open connections
   - **Solution**: Connection pooling, reuse connections

4. **Type Drift**: Schema changes not reflected in types
   - **Solution**: Generate types from schema, use type-safe ORM

5. **Migration Conflicts**: Team members creating conflicting migrations
   - **Solution**: Migration generation tools, code review, clear process

## Migration Strategies

### Schema-First
1. Define schema in code
2. Generate migration from schema changes
3. Apply migration to database
4. Types automatically updated

**Best for**: Greenfield projects, schema evolution

### Database-First
1. Modify database directly
2. Introspect database to update types/models
3. Generate migration from database state
4. Check into version control

**Best for**: Existing databases, DBA-managed schemas

### Code-First Hybrid
1. Write migration manually
2. Apply to development database
3. Regenerate types from updated database
4. Test before deploying

**Best for**: Complex migrations, custom SQL needs

## Testing Strategies

### In-Memory Database
- Fast, isolated tests
- Good for unit tests
- May not match production database exactly

### Test Database
- More realistic
- Slower test execution
- Requires cleanup between tests

### Transaction Rollback
- Fast isolation
- Works with real database
- Can't test transaction logic

### Mocking Repository
- Fastest option
- Tests business logic only
- Doesn't test actual queries

## Resources

### Learning
- Database design fundamentals
- SQL performance optimization
- Transaction isolation levels
- Connection pooling strategies

### Tools
- Database migration tools
- Query analyzers
- Performance monitors
- Schema visualization

### Further Reading
- "Designing Data-Intensive Applications" by Martin Kleppmann
- Database-specific best practices guides
- ORM/query builder documentation
