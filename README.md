# Mono
[![GitHub Stars](https://img.shields.io/github/stars/zeljkovranjes/mono.svg)](https://github.com/zeljkovranjes/mono/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/zeljkovranjes/mono.svg)](https://github.com/zeljkovranjes/mono/issues)
[![Current Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/zeljkovranjes/mono)

Mono is a SaaS monolith boilerplate application with a simple multi-tenant architecture. It’s fairly barebones and missing several routes, which you can easily implement yourself. However, all the core functions needed to build those routes are already included. I plan to add and push these routes over time, **though development is currently on and off**.

This project was built around utilizing Ory and in my case I utilized the Ory Network. It's recommended to use it or else you will have to heavily edit the code.

- **Authentication & Authorization** — Integrated with Ory
, providing secure user management, sessions, and role-based access control out of the box.
- **Billing & Subscriptions** — Built-in Stripe
 integration for handling subscriptions, payments, invoices, and webhooks with minimal setup. You can also integrate your payment gateway by using the BillingAdapter.
- **Organizations & Projects** — Users can create organizations and, within each organization, create projects. This structure makes it easy to manage multi-tenant workflows.
- **Logging & Audit Trails** — Simple request/event logging plus audit logs for security and compliance: who did what, when, and where (scoped by org/project).

# Requirements

- **Ory Network** (Recommended to use Ory Network and not host it individually.)
- **Ory Tunnel**
- **Stripe** 
- **PostgreSQL**
- **ngrok**

# Installation (Local Development)

<details><summary><b>Ory Network Setup</b></summary>

## 1. Setting up Identity Schema
* Go into User Management -> Identity Schema -> Then scroll all the way to the bottom to **Create new schema from preset** then click **create**.

And paste the following code.
```json
{
  "$id": "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Person",
  "type": "object",
  "properties": {
    "traits": {
      "type": "object",
      "properties": {
        "email": {
          "type": "string",
          "format": "email",
          "title": "E-Mail",
          "ory.sh/kratos": {
            "credentials": {
              "password": {
                "identifier": true
              },
              "webauthn": {
                "identifier": true
              },
              "totp": {
                "account_name": true
              },
              "code": {
                "identifier": true,
                "via": "email"
              },
              "passkey": {
                "display_name": true
              }
            },
            "recovery": {
              "via": "email"
            },
            "verification": {
              "via": "email"
            },
            "organizations": {
              "matcher": "email_domain"
            }
          },
          "maxLength": 320
        },
        "name": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "first": {
              "type": "string",
              "title": "First name",
              "maxLength": 256
            },
            "last": {
              "type": "string",
              "title": "Last name",
              "maxLength": 256
            }
          }
        },
        "avatar": {
          "type": "string",
          "title": "Avatar URL",
          "maxLength": 2048
        }
      },
      "required": [
        "email"
      ],
      "additionalProperties": false
    }
  }
}
```

## 2. Setting up Branding
* Go to Branding -> UI URLs and replace all of them with http://localhost:3000/{route} for example login should be http://localhost:3000/login then registration should be http://localhost:3000/signup.

## 3. Setting up Keto (Namespace & Rules)
* Go into Permissions -> Namespace & rules and paste the following code.
```
import { Namespace, SubjectSet, Context } from "@ory/permission-namespace-types"

// Defines a User. This class is primarily used as a type in relationships.
class User implements Namespace {}

// Defines a Organization with member and admin roles.
class Organization implements Namespace {
  related: {
    members: User[],
    admins: User[]
  }

  permits = {
    // A user can view the organization if they are a member or an admin.
    view: (ctx: Context): boolean =>
      this.related.members.includes(ctx.subject) ||
      this.related.admins.includes(ctx.subject),

    // Only admins can manage the organization.
    manage: (ctx: Context): boolean =>
      this.related.admins.includes(ctx.subject),
  }
}

// Defines a Project with relationships to users and organizations using SubjectSet.
class Project implements Namespace {
  related: { // <-- CORRECTED: Use a type annotation with ':'
    // A project is associated with one organization.
    organization: Organization[],

    // Owners can be individual users or the entire set of admins from the related organization.
    owners: (User | SubjectSet<Organization, "admins">)[],

    // Editors can be individual users or the entire set of admins from the related organization.
    editors: (User | SubjectSet<Organization, "admins">)[],

    // Viewers can be individual users, or the entire set of members or admins from the related organization.
    viewers: (User | SubjectSet<Organization, "members"> | SubjectSet<Organization, "admins">)[]
  }

  permits = {
    // A user can view if they are a viewer, editor, or owner.
    // The .includes() check automatically resolves if the user is part of a related SubjectSet.
    view: (ctx: Context): boolean =>
      this.related.viewers.includes(ctx.subject) ||
      this.related.editors.includes(ctx.subject) ||
      this.related.owners.includes(ctx.subject),

    // A user can edit if they are an editor or an owner.
    edit: (ctx: Context): boolean =>
      this.related.editors.includes(ctx.subject) ||
      this.related.owners.includes(ctx.subject),

    // Only owners can manage the project.
    manage: (ctx: Context): boolean =>
      this.related.owners.includes(ctx.subject),
  }
}
```

## 4. Setting up OAuth2
* Go into Authentication -> Social Sign-In (OIDC) -> Thenc lick Add new OpenID Connect Provider.

The actual dashboard that is located in apps/dashboard should automatically resolve the OpenID Connect providers. I know it works for Google, I believe GitHub and Microsoft as well.

## 5. Setting up Stripe Customer Creation via Ory Actions
* The whole point of this is to create a stripe customer on registration. Simply go to Authentication -> Actions & Webhooks -> **Create new Action**

**I'm going to assume you know how to setup ngrok and it's best to use a static address for this** simply point ngrok to the *billing-api* server.

And use the following settings:

Flow: **Registration**

Execution: **After**

Method: **OpenID Connect (OIDC)**

URL: {ngrok_url_to_billing_api}

Method: **POST**

Action HTTP body
```javascript
function(ctx) {
  id: ctx.identity.id,
  email: ctx.identity.traits.email,
  name: if ctx.identity.traits.name != null then
    (ctx.identity.traits.name.first + " " + ctx.identity.traits.name.last)
  else "",
  avatar: if ctx.identity.traits.avatar != null then ctx.identity.traits.avatar else "",
}
```
Asynchronous: **OFF**

Process response: **OFF**

When it shows authentication Click Authentication type: **Key** and put the Transport mode to **Header**.

key name: **Authorization**

Key value: Bearer {API_SECRET_KEY} (the value from the .env) then click **save action**. MAKE SURE YOU INCLUDE "Bearer"!!!

## 6. Setting up Ory Tunnel
* Install the Ory Tunnel CLI here https://www.ory.sh/docs/cli/ory-tunnel. Then run the following command.

</details>

