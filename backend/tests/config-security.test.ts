import {test} from "node:test"
import assert from "node:assert/strict"
import {applicationSecret,originList} from "../src/lib/config-security"

test("production CORS requires exact HTTPS origins",()=>{
  assert.equal(originList("https://shop.example.com, https://admin.example.com",true,"AUTH_CORS"),"https://shop.example.com,https://admin.example.com")
  assert.equal(originList("http://localhost:3000",false,"STORE_CORS"),"http://localhost:3000")
  for(const value of ["*","https://*.example.com","http://shop.example.com","https://shop.example.com/path","https://shop.example.com/"])assert.throws(()=>originList(value,true,"STORE_CORS"))
})

test("application secrets reject short or example credentials",()=>{
  assert.equal(applicationSecret("a".repeat(64),"JWT_SECRET"),"a".repeat(64))
  for(const value of ["supersecret","replace-with-64-random-characters","short"])assert.throws(()=>applicationSecret(value,"JWT_SECRET"))
})
