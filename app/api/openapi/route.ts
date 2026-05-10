import { NextResponse } from "next/server";
import { permissionOptions, roleOptions } from "@/lib/auth";
import { dentistOptions, serviceOptions, statusOptions } from "@/lib/appointments";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      openapi: "3.1.0",
      info: {
        title: "Dental Clinic Appointment Manager API",
        version: "1.0.0",
        description:
          "REST API for Laboratory Work 7. Endpoints require a short-lived JWT issued by /token and support appointment CRUD operations with pagination."
      },
      servers: [
        {
          url: "/"
        }
      ],
      tags: [
        {
          name: "Auth",
          description: "Demo JWT issuing endpoint"
        },
        {
          name: "Appointments",
          description: "Authenticated appointment CRUD"
        }
      ],
      paths: {
        "/token": {
          get: {
            tags: ["Auth"],
            summary: "Issue a JWT from query parameters",
            parameters: [
              {
                name: "role",
                in: "query",
                schema: {
                  type: "string",
                  enum: roleOptions
                }
              },
              {
                name: "permissions",
                in: "query",
                description: "Comma-separated permissions, for example READ,WRITE.",
                schema: {
                  type: "string"
                }
              }
            ],
            responses: {
              "200": {
                description: "JWT issued for the requested role or permissions.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/TokenResponse"
                    }
                  }
                }
              },
              "400": {
                $ref: "#/components/responses/BadRequest"
              }
            }
          },
          post: {
            tags: ["Auth"],
            summary: "Issue a JWT from a JSON body",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/TokenRequest"
                  },
                  examples: {
                    admin: {
                      value: {
                        role: "ADMIN"
                      }
                    },
                    customPermissions: {
                      value: {
                        permissions: ["READ", "WRITE"]
                      }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "JWT issued for the requested role or permissions.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/TokenResponse"
                    }
                  }
                }
              },
              "400": {
                $ref: "#/components/responses/BadRequest"
              }
            }
          }
        },
        "/api/appointments": {
          get: {
            tags: ["Appointments"],
            summary: "List appointments",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                name: "limit",
                in: "query",
                description: "Maximum number of records to return. Maximum accepted value is 100.",
                schema: {
                  type: "integer",
                  default: 25,
                  minimum: 1,
                  maximum: 100
                }
              },
              {
                name: "offset",
                in: "query",
                description: "Number of matching records to skip.",
                schema: {
                  type: "integer",
                  default: 0,
                  minimum: 0
                }
              },
              {
                name: "query",
                in: "query",
                schema: {
                  type: "string"
                }
              },
              {
                name: "status",
                in: "query",
                schema: {
                  type: "string",
                  enum: ["All", ...statusOptions],
                  default: "All"
                }
              },
              {
                name: "dentist",
                in: "query",
                schema: {
                  type: "string",
                  default: "All"
                }
              },
              {
                name: "priorityOnly",
                in: "query",
                schema: {
                  type: "boolean",
                  default: false
                }
              },
              {
                name: "sort",
                in: "query",
                schema: {
                  type: "string",
                  enum: ["soonest", "latest"],
                  default: "soonest"
                }
              }
            ],
            responses: {
              "200": {
                description: "Paginated appointments.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/AppointmentList"
                    }
                  }
                }
              },
              "401": {
                $ref: "#/components/responses/Unauthorized"
              },
              "403": {
                $ref: "#/components/responses/Forbidden"
              }
            }
          },
          post: {
            tags: ["Appointments"],
            summary: "Create an appointment",
            security: [
              {
                bearerAuth: []
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AppointmentInput"
                  }
                }
              }
            },
            responses: {
              "201": {
                description: "Appointment created.",
                headers: {
                  Location: {
                    schema: {
                      type: "string"
                    }
                  }
                },
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Appointment"
                    }
                  }
                }
              },
              "400": {
                $ref: "#/components/responses/BadRequest"
              },
              "401": {
                $ref: "#/components/responses/Unauthorized"
              },
              "403": {
                $ref: "#/components/responses/Forbidden"
              }
            }
          }
        },
        "/api/appointments/{id}": {
          get: {
            tags: ["Appointments"],
            summary: "Read one appointment",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                $ref: "#/components/parameters/AppointmentId"
              }
            ],
            responses: {
              "200": {
                description: "Appointment found.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Appointment"
                    }
                  }
                }
              },
              "401": {
                $ref: "#/components/responses/Unauthorized"
              },
              "404": {
                $ref: "#/components/responses/NotFound"
              }
            }
          },
          put: {
            tags: ["Appointments"],
            summary: "Update an appointment",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                $ref: "#/components/parameters/AppointmentId"
              }
            ],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/AppointmentUpdate"
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Appointment updated.",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Appointment"
                    }
                  }
                }
              },
              "400": {
                $ref: "#/components/responses/BadRequest"
              },
              "401": {
                $ref: "#/components/responses/Unauthorized"
              },
              "403": {
                $ref: "#/components/responses/Forbidden"
              },
              "404": {
                $ref: "#/components/responses/NotFound"
              }
            }
          },
          delete: {
            tags: ["Appointments"],
            summary: "Delete an appointment",
            security: [
              {
                bearerAuth: []
              }
            ],
            parameters: [
              {
                $ref: "#/components/parameters/AppointmentId"
              }
            ],
            responses: {
              "204": {
                description: "Appointment deleted."
              },
              "401": {
                $ref: "#/components/responses/Unauthorized"
              },
              "403": {
                $ref: "#/components/responses/Forbidden"
              },
              "404": {
                $ref: "#/components/responses/NotFound"
              }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        },
        parameters: {
          AppointmentId: {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "string"
            }
          }
        },
        responses: {
          BadRequest: {
            description: "Invalid request.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          Unauthorized: {
            description: "Missing, invalid, or expired token.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          Forbidden: {
            description: "The token does not include the required permission.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          },
          NotFound: {
            description: "Appointment not found.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse"
                }
              }
            }
          }
        },
        schemas: {
          Appointment: {
            type: "object",
            required: ["id", "patient", "dentist", "service", "date", "time", "status", "notes", "favorite"],
            properties: {
              id: {
                type: "string",
                example: "apt-1"
              },
              patient: {
                type: "string",
                example: "Mara Ionescu"
              },
              dentist: {
                type: "string",
                enum: dentistOptions,
                example: "Dr. Ana Pop"
              },
              service: {
                type: "string",
                enum: serviceOptions,
                example: "Routine cleaning"
              },
              date: {
                type: "string",
                format: "date",
                example: "2026-05-05"
              },
              time: {
                type: "string",
                pattern: "^([01]\\\\d|2[0-3]):[0-5]\\\\d$",
                example: "09:30"
              },
              status: {
                type: "string",
                enum: statusOptions
              },
              notes: {
                type: "string"
              },
              favorite: {
                type: "boolean"
              }
            }
          },
          AppointmentInput: {
            type: "object",
            required: ["patient", "dentist", "service", "date", "time", "status"],
            properties: {
              patient: {
                type: "string",
                example: "Daniel Marin"
              },
              dentist: {
                type: "string",
                enum: dentistOptions,
                example: "Dr. Ana Pop"
              },
              service: {
                type: "string",
                enum: serviceOptions,
                example: "Routine cleaning"
              },
              date: {
                type: "string",
                format: "date",
                example: "2026-05-07"
              },
              time: {
                type: "string",
                pattern: "^([01]\\\\d|2[0-3]):[0-5]\\\\d$",
                example: "10:00"
              },
              status: {
                type: "string",
                enum: statusOptions
              },
              notes: {
                type: "string"
              },
              favorite: {
                type: "boolean",
                default: false
              }
            }
          },
          AppointmentUpdate: {
            type: "object",
            description: "Any subset of appointment fields except id.",
            properties: {
              patient: {
                type: "string"
              },
              dentist: {
                type: "string"
              },
              service: {
                type: "string"
              },
              date: {
                type: "string",
                format: "date"
              },
              time: {
                type: "string"
              },
              status: {
                type: "string",
                enum: statusOptions
              },
              notes: {
                type: "string"
              },
              favorite: {
                type: "boolean"
              }
            }
          },
          AppointmentList: {
            type: "object",
            required: ["data", "pagination"],
            properties: {
              data: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/Appointment"
                }
              },
              pagination: {
                type: "object",
                required: ["total", "limit", "offset", "returned", "nextOffset", "previousOffset"],
                properties: {
                  total: {
                    type: "integer"
                  },
                  limit: {
                    type: "integer"
                  },
                  offset: {
                    type: "integer"
                  },
                  returned: {
                    type: "integer"
                  },
                  nextOffset: {
                    type: ["integer", "null"]
                  },
                  previousOffset: {
                    type: ["integer", "null"]
                  }
                }
              }
            }
          },
          TokenRequest: {
            type: "object",
            properties: {
              role: {
                type: "string",
                enum: roleOptions
              },
              permissions: {
                type: "array",
                items: {
                  type: "string",
                  enum: permissionOptions
                }
              }
            }
          },
          TokenResponse: {
            type: "object",
            required: ["token", "tokenType", "expiresIn", "expiresAt", "role", "permissions"],
            properties: {
              token: {
                type: "string"
              },
              tokenType: {
                type: "string",
                example: "Bearer"
              },
              expiresIn: {
                type: "integer",
                example: 60
              },
              expiresAt: {
                type: "string",
                format: "date-time"
              },
              role: {
                type: "string",
                enum: roleOptions
              },
              permissions: {
                type: "array",
                items: {
                  type: "string",
                  enum: permissionOptions
                }
              }
            }
          },
          ErrorResponse: {
            type: "object",
            required: ["error"],
            properties: {
              error: {
                type: "string"
              }
            }
          }
        }
      }
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
