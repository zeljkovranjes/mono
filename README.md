# Mono
[![GitHub Stars](https://img.shields.io/github/stars/zeljkovranjes/mono.svg)](https://github.com/zeljkovranjes/mono/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/zeljkovranjes/mono.svg)](https://github.com/zeljkovranjes/mono/issues)
[![Current Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/zeljkovranjes/mono)

Mono is a SaaS monolith boilerplate application with a simple multi-tenant architecture. It’s fairly barebones and missing several routes, which you can easily implement yourself. However, all the core functions needed to build those routes are already included. I plan to add and push these routes over time, **though development is currently on and off**.

This project was built around utilizing Ory and in my case I utilized the Ory Network. It's recommended to use it or else you will have to heavily edit the code.

- **Authentication & Authorization** - Integrated with Ory
, providing secure user management, sessions, and role-based access control out of the box.
- **Billing & Subscriptions** - Built-in Stripe
 integration for handling subscriptions, payments, invoices, and webhooks with minimal setup. You can also integrate your payment gateway by using the BillingAdapter.
- **Organizations & Projects** - Users can create organizations and, within each organization, create projects. This structure makes it easy to manage multi-tenant workflows.
- **Logging & Audit Trails** - Simple request/event logging plus audit logs for security and compliance: who did what, when, and where (scoped by org/project).

