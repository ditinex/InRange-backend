define({ "api": [
  {
    "type": "post",
    "url": "/admins/signup",
    "title": "Add admin account",
    "name": "AdminSignup",
    "group": "Admin",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Admins unique email.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name contains alphabets only.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>Password must contain atleast one number, one capital alphabet, one small alphabet, one special character and between 8-24 character.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>Admin type as ENUM[ admin, analyst ].</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n\t\t\t\"status\": \"success\",\n\t\t\t\"data\": {\n\t\t\t\t\"_id\": \"5f62722a4bf8b92249c9caa6\",\n\t\t\t\t\"name\": \"Demo Admin\",\n\t\t\t\t\"email\": \"demo@demo.com\",\n\t\t\t\t\"type\": \"admin\",\n\t\t\t\t\"createdAt\": \"2020-09-16T20:14:34.112Z\",\n\t\t\t\t\"updatedAt\": \"2020-09-16T20:14:34.112Z\"\n\t\t\t}\n\t}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 202 Error\n{\n  \"status\": \"failed\", message: \"Email already exists.\",\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "controllers/authController.js",
    "groupTitle": "Admin"
  }
] });
