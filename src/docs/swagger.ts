import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Crawler API",
      version: process.env.NPM_PACKAGE_VERSION || "1.0.0",
      description:
        "API for crawling websites (SPA, SSR, PWA) and saving HTML results.",
    },
    servers: [
      {
        url: process.env.BASE_URL_API || "http://localhost:4100/api/v1",
        description: "API Server",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Application health and system information",
      },
      {
        name: "Crawler",
        description: "Website crawling operations",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
