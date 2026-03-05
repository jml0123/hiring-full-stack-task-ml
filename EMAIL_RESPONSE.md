Hi Marcus,

Thanks for the update -- first of all, that's amazing news! It's exciting to hear how our works have translated to a potential enteprise deal.

I've reviewed the initial technical requirements you've mentioned, and I want to clarify a few things in light of the upcoming Friday demo:

- What are some of the top 1-2 priorities we want to demonstrate for our demo this Friday? We can work with their legal team towards fulfilling the technical requirements, but what workflows do we want to demonstrate in the demo.

Some early comments below for the specific requests mentioned:
- Full multi-tenant architecture with complete data isolation
	- What is meant by "complete data isolation"? If I am understanding this correctly, this will require us to refactor our databases and spin up a custom database for each client
- Custom subdomain for each tenant (tenant1.ourapp.com, tenant2.ourapp.com)
	- We'll need to revisit our existing API to support multiple domain contexts
- SSO integration (SAML 2.0)
	- We'll need to revisit our current auth flow for this in order to support multi-tenant SSO, as our current auth middleware is just based on userId.
- Tenant-specific branding and configuration
	- This is a cool idea! We can have configurations for each tenant which will be viewable in the frontend.
- Role-based access control per tenant
	- We'll need to build on top of our existing API to ensure access is validated correctly downstream, and revisit our schemas for users (or tenants), potentially create a new table for roles.
- Audit logging for all tenant activities
	- This is a good idea as we should start monitoring the transactions and operations witin our backend. We'll need to audit our existing API and see where these monitoring functions can take place.

Considering these are some significant changes, would love to schedule some time to discuss this with the team. Congratulations again!

All the best,
Miguel
