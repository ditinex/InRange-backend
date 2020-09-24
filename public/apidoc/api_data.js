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
    "filename": "InRange-backend/controllers/authController.js",
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
          "content": "    HTTP/1.1 200 OK\n    \n{\n    \"status\": \"success\",\n    \"data\": {\n        \"_id\": \"5f67ac2e9a599b177fba55b5\",\n        \"provider\": {\n            \"verification_document\": null,\n            \"service\": \"\",\n            \"description\": \"\"\n        },\n        \"is_switched_provider\": false,\n        \"is_available\": true,\n        \"name\": \"Demo\",\n        \"gender\": \"male\",\n        \"mobile\": \"919903614706\",\n        \"address\": \"kjhkd kjdhfbk\",\n        \"status\": \"approved\",\n        \"location\": {\n            \"type\": \"Point\",\n            \"coordinates\": [\n                -110.8571443,\n                32.4586858\n            ]\n        },\n        \"active_session_refresh_token\": \"5OwDBqzHLUFj54TJ\",\n        \"profile_picture\": \"/images/1600629806826.jpg\",\n        \"createdAt\": \"2020-09-20T19:23:26.855Z\",\n        \"updatedAt\": \"2020-09-20T19:26:52.477Z\",\n        \"__v\": 0,\n        \"access_token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjdhYzJlOWE1OTliMTc3ZmJhNTViNSIsIm1vYmlsZSI6IjkxOTkwMzYxNDcwNiIsIm5hbWUiOiJEZW1vIiwiaWF0IjoxNjAwNjMwMDc0LCJleHAiOjE2MDA3MTY0NzR9.FMZe0ttT1qtzvXbCbO_uKLj_EHwIDslDO4uq_IVw2_E\",\n        \"isUserExists\": true\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "InRange-backend/controllers/authController.js",
    "groupTitle": "Auth"
  },
  {
    "type": "get",
    "url": "/auth/refresh-token/:mobile/:token",
    "title": "Refresh access token",
    "name": "RefreshToken",
    "group": "Auth",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Refresh token of the user.</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "mobile",
            "description": "<p>Registered mobile number.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    \n{\n    \"status\": \"success\",\n    \"data\": {\n        \"access_token\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNjdhYzJlOWE1OTliMTc3ZmJhNTViNSIsIm1vYmlsZSI6IjkxOTkwMzYxNDcwNiIsIm5hbWUiOiJEZW1vIiwiaWF0IjoxNjAwNjMyMDgxLCJleHAiOjE2MDA3MTg0ODF9.Uj642GC9-b_dkoTR1lrq2Z3PouybDz1Q-gzAw2TRCCI\"\n    }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "InRange-backend/controllers/authController.js",
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
    "filename": "InRange-backend/controllers/authController.js",
    "groupTitle": "Auth"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "InRange-backend/public/apidoc/main.js",
    "group": "D:\\projects\\InRange-backend\\public\\apidoc\\main.js",
    "groupTitle": "D:\\projects\\InRange-backend\\public\\apidoc\\main.js",
    "name": ""
  },
  {
    "type": "post",
    "url": "/consumer/createtask",
    "title": "Create Task",
    "name": "Create_Task",
    "group": "Task",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Contact name without extra spaces and within 25 length</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "title",
            "description": "<p>Title without extra spaces and within 25 length</p>"
          },
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "mobile",
            "description": "<p>Users unique mobile with ISD code i.e 919903614705.</p>"
          },
          {
            "group": "Parameter",
            "type": "Sting",
            "optional": false,
            "field": "service",
            "description": "<p>Service type in text.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "description",
            "description": "<p>Description in text.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "instruction",
            "description": "<p>Service instruction (optional).</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "address",
            "description": "<p>Address in text.</p>"
          },
          {
            "group": "Parameter",
            "type": "Sting",
            "optional": false,
            "field": "status",
            "description": "<p>ENUM['Hiring', 'In-progress', 'Completed', 'Cancelled'].</p>"
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
            "type": "Files",
            "optional": false,
            "field": "images",
            "description": "<p>Service images (optional).</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n    {\n\t\t\"status\": \"success\",\n\t\t\"data\": {\n\t\t\t\"cost\": {\n\t\t\t\t\"service_cost\": 0,\n\t\t\t\t\"other_cost\": 0,\n\t\t\t\t\"discount\": 0,\n\t\t\t\t\"total\": 0\n\t\t\t},\n\t\t\t\t\"images\": [\n\t\t\t\t\t\"/images/1600831745264.jpg\",\n\t\t\t\t\t\"/images/1600831745479.jpg\"\n\t\t\t\t],\n\t\t\t\t\"_id\": \"5f6ac1019b088f4c6cc2ed48\",\n\t\t\t\t\"title\": \"Tap need\",\n\t\t\t\t\"service\": \"Tap repair\",\n\t\t\t\t\"description\": \"Good Task\",\n\t\t\t\t\"instruction\": \"Need Faster\",\n\t\t\t\t\"name\": \"Test\",\n\t\t\t\t\"mobile\": \"919804985304\",\n\t\t\t\t\"status\": \"Hiring\",\n\t\t\t\t\"address\": \"India\",\n\t\t\t\t\"location\": {\n\t\t\t\t\t\"type\": \"Point\",\n\t\t\t\t\t\"coordinates\": [\n\t\t\t\t\t\t-110.8571443,\n\t\t\t\t\t\t32.4586858\n\t\t\t\t\t]\n\t\t\t\t},\n\t\t\t\t\"proposals\": [],\n\t\t\t\t\"createdAt\": \"2020-09-23T03:29:05.501Z\",\n\t\t\t\t\"updatedAt\": \"2020-09-23T03:29:05.501Z\",\n\t\t\t\t\"__v\": 0\n\t\t\t}\n\t\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "InRange-backend/controllers/taskController.js",
    "groupTitle": "Task"
  },
  {
    "type": "post",
    "url": "/provider/sendproposal",
    "title": "Send Proposal",
    "name": "Send_Proposal",
    "group": "Task",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "ObjectId",
            "optional": false,
            "field": "task_id",
            "description": "<p>Id of the task.</p>"
          },
          {
            "group": "Parameter",
            "type": "ObjectId",
            "optional": false,
            "field": "provider",
            "description": "<p>Id of the provider.</p>"
          },
          {
            "group": "Parameter",
            "type": "Sting",
            "optional": false,
            "field": "cover_letter",
            "description": "<p>Proposal letter in text.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n\t\t{\n\t\t\t\"status\": \"success\",\n\t\t\t\"data\": {\n\t\t\t\t\"location\": {\n\t\t\t\t\t\"type\": \"Point\",\n\t\t\t\t\t\"coordinates\": [\n\t\t\t\t\t\t-110.8571443,\n\t\t\t\t\t\t32.4586858\n\t\t\t\t\t]\n\t\t\t\t},\n\t\t\t\t\"cost\": {\n\t\t\t\t\t\"service_cost\": 0,\n\t\t\t\t\t\"other_cost\": 0,\n\t\t\t\t\t\"discount\": 0,\n\t\t\t\t\t\"total\": 0\n\t\t\t\t},\n\t\t\t\t\"images\": [\n\t\t\t\t\t\"/images/1600840282151.jpg\",\n\t\t\t\t\t\"/images/1600840282166.jpg\"\n\t\t\t\t],\n\t\t\t\t\"_id\": \"5f6ae25a9647803978867259\",\n\t\t\t\t\"title\": \"Tap Repair test\",\n\t\t\t\t\"service\": \"repair\",\n\t\t\t\t\"description\": \"broken tap\",\n\t\t\t\t\"instruction\": \"Not specified\",\n\t\t\t\t\"name\": \"souradeep\",\n\t\t\t\t\"mobile\": \"919804985304\",\n\t\t\t\t\"status\": \"Hiring\",\n\t\t\t\t\"address\": \"india\",\n\t\t\t\t\"proposals\": [\n\t\t\t\t\t{\n\t\t\t\t\t\t\"_id\": \"5f6ae76860814f139cc9feb4\",\n\t\t\t\t\t\t\"provider\": \"5f67ac2e9a599b177fba55b5\",\n\t\t\t\t\t\t\"cover_letter\": \"hi\"\n\t\t\t\t\t},\n\t\t\t\t\t{\n\t\t\t\t\t\t\"_id\": \"5f6b28f1039e8158f879431b\",\n\t\t\t\t\t\t\"provider\": \"5f67ac2e9a599b177fba55b5\",\n\t\t\t\t\t\t\"cover_letter\": \"hi\"\n\t\t\t\t\t}\n\t\t\t\t],\n\t\t\t\t\"createdAt\": \"2020-09-23T05:51:22.187Z\",\n\t\t\t\t\"updatedAt\": \"2020-09-23T10:52:33.909Z\",\n\t\t\t\t\"__v\": 0\n\t\t\t}\n\t\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "InRange-backend/controllers/taskController.js",
    "groupTitle": "Task"
  },
  {
    "type": "post",
    "url": "/provider/review",
    "title": "Send Review",
    "name": "Send_Review",
    "group": "Task",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "rating",
            "description": "<p>Rating value between 1 and 5</p>"
          },
          {
            "group": "Parameter",
            "type": "ObjectId",
            "optional": false,
            "field": "provider",
            "description": "<p>Id of the provider.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Name of user in text.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "feedback",
            "description": "<p>Feedback in text.</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "    HTTP/1.1 200 OK\n\t{\n\t\t\t\"status\": \"success\",\n\t\t\t\"data\": {\n\t\t\t\t\"rating\": 2,\n\t\t\t\t\"_id\": \"5f6c381085dad029f085cc8e\",\n\t\t\t\t\"provider\": \"5f67ac2e9a599b177fba55b5\",\n\t\t\t\t\"username\": \"Demo\",\n\t\t\t\t\"feedback\": \"Good Boy\",\n\t\t\t\t\"createdAt\": \"2020-09-24T06:09:20.464Z\",\n\t\t\t\t\"updatedAt\": \"2020-09-24T06:09:20.464Z\",\n\t\t\t\t\"__v\": 0\n\t\t\t}\n\t\t}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "InRange-backend/controllers/taskController.js",
    "groupTitle": "Task"
  }
] });