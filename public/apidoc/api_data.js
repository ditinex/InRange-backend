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
  },
  {
    "type": "post",
    "url": "/auth/login",
    "title": "Login to user account",
    "name": "Login_User",
    "group": "Auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "mobile",
            "description": "<p>User's unique mobile number.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "otp",
            "description": "<p>OTP.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n\t\t\t\n\t   }",
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
    "groupTitle": "Auth"
  },
  {
    "type": "post",
    "url": "/auth/signup",
    "title": "Add user account",
    "name": "Signup_User",
    "group": "Auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "mobile",
            "description": "<p>Users unique mobile with ISD code i.e 919903614705.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": ""
          },
          {
            "group": "Parameter",
            "type": "Sting",
            "optional": false,
            "field": "gender",
            "description": "<p>ENUM[male,female].</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": "<p>Address in text (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "profile_picture",
            "description": "<p>Form encoded image file.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "service",
            "description": "<p>(applicable for provider only).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>(optional &amp; application for provider only).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "location",
            "description": "<p>JSON stringify string with coordinates i.e {&quot;longitude&quot;:&quot;-110.8571443&quot;,&quot;lattitude&quot;:&quot;32.4586858&quot;}.</p>"
          },
          {
            "group": "Parameter",
            "type": "File",
            "optional": false,
            "field": "verification_document",
            "description": "<p>(optional &amp; applicable only for certain services in provider).</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    \n{\n    \"status\": \"success\",\n    \"data\": {\n        \"location\": {\n            \"type\": \"Point\",\n            \"coordinates\": [\n                -110.8571443,\n                32.4586858\n            ]\n        },\n        \"provider\": {\n            \"verification_document\": null,\n            \"service\": \"\",\n            \"description\": \"\"\n        },\n        \"is_switched_provider\": false,\n        \"is_available\": true,\n        \"_id\": \"5f6504df4619710c2354cbf4\",\n        \"name\": \"Demo\",\n        \"gender\": \"male\",\n        \"mobile\": 919903614705,\n        \"address\": \"21 Parking Street\",\n        \"status\": \"approved\",\n        \"active_session_refresh_token\": \"sfYP6WRAoF9q2GPG\",\n        \"profile_picture\": \"/images/1600455903339.jpg\",\n        \"createdAt\": \"2020-09-18T19:05:03.461Z\",\n        \"updatedAt\": \"2020-09-18T19:05:03.799Z\",\n        \"__v\": 0,\n        \"access_token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjUwNGRmNDYxOTcxMGMyMzU0Y2JmNCIsIm1vYmlsZSI6OTE5OTAzNjE0NzA1LCJuYW1lIjoiRGVtbyIsImlhdCI6MTYwMDQ1NTkwMywiZXhwIjoxNjAwNTQyMzAzfQ._Aey4GEfFhWzmVrWgccfzbPL3lvmGEzGvM6Ndc1QkPk\"\n    }\n}",
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
    "groupTitle": "Auth"
  }
] });
