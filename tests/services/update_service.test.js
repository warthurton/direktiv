import request from 'supertest'
import retry from "jest-retries";
import common from "../common";

const testNamespace = "test-services"

describe('Test services operations with envs', () => {
    beforeAll(common.helpers.deleteAllNamespaces)

    common.helpers.itShouldCreateNamespace(it, expect, testNamespace)

    common.helpers.itShouldCreateFile(it, expect, testNamespace,
        "/s1.yaml", `
direktiv_api: service/v1
image: direktiv/request
scale: 1
`)

    let listRes;
    retry(`should list all services`, 10, async () => {
        await sleep(500)
        listRes = await request(common.config.getDirektivHost())
            .get(`/api/v2/namespaces/${testNamespace}/services`)
        expect(listRes.statusCode).toEqual(200)
        expect(listRes.body).toMatchObject({
            data: [
                {
                    type: 'namespace-service',
                    namespace: 'test-services',
                    filePath: '/s1.yaml',
                    name: '',
                    image: 'direktiv/request',
                    error: null,
                    id: 'test-services-s1-yaml-466337cb33',
                },
            ]
        })
    })

    common.helpers.itShouldUpdateFile(it, expect, testNamespace,
        "/s1.yaml", `
    direktiv_api: service/v1
    image: direktiv/request
    scale: 1
    envs:
    - name: hello
      value: world
    `)

    retry(`should list all services`, 10, async () => {
        await sleep(500)
        listRes = await request(common.config.getDirektivHost())
            .get(`/api/v2/namespaces/${testNamespace}/services`)

        expect(listRes.statusCode).toEqual(200)
        expect(listRes.body).toMatchObject({
            data: [
                {
                    type: 'namespace-service',
                    namespace: 'test-services',
                    filePath: '/s1.yaml',
                    name: '',
                    image: 'direktiv/request',
                    error: null,
                    envs: [
                        {
                            name: "hello",
                            value: "world"
                        }
                    ],
                    id: 'test-services-s1-yaml-466337cb33',
                },
            ]
        })
    })

    common.helpers.itShouldUpdateFile(it, expect, testNamespace,
        "/s1.yaml", `
    direktiv_api: service/v1
    image: direktiv/request:v4
    scale: 1
    envs:
    - name: hello
      value: world
    - name: hello1
      value: world1
    `)

    retry(`should list all services`, 10, async () => {
        await sleep(500)
        listRes = await request(common.config.getDirektivHost())
            .get(`/api/v2/namespaces/${testNamespace}/services`)

        expect(listRes.statusCode).toEqual(200)
        expect(listRes.body).toMatchObject({
            data: [
                {
                    type: 'namespace-service',
                    namespace: 'test-services',
                    filePath: '/s1.yaml',
                    name: '',
                    image: 'direktiv/request:v4',
                    error: null,
                    envs: [
                        {
                            name: "hello",
                            value: "world"
                        },
                        {
                            name: "hello1",
                            value: "world1"
                        }
                    ],
                    id: 'test-services-s1-yaml-466337cb33',
                },
            ]
        })
    })

});

describe('Test workflow operations with envs', () => {
    beforeAll(common.helpers.deleteAllNamespaces)

    common.helpers.itShouldCreateNamespace(it, expect, testNamespace)

    common.helpers.itShouldCreateFile(it, expect, testNamespace,
        "/w2.yaml", `
description: something
functions:
- id: get
  image: direktiv/request
  type: knative-workflow
states:
- id: foo
  type: noop
`)

    let listRes;
    retry(`should list all services`, 10, async () => {
        await sleep(500)
        listRes = await request(common.config.getDirektivHost())
            .get(`/api/v2/namespaces/${testNamespace}/services`)
        expect(listRes.statusCode).toEqual(200)
        expect(listRes.body).toMatchObject({
            data: [
                {
                    type: 'workflow-service',
                    namespace: 'test-services',
                    filePath: '/w2.yaml',
                    name: 'get',
                    image: 'direktiv/request',
                    error: null,
                    id: 'test-services-get-w2-yaml-9cca18d982',
                },
            ]
        })
    })

    common.helpers.itShouldUpdateFile(it, expect, testNamespace,
        "/w2.yaml", `
description: something
functions:
- id: get
  image: direktiv/request
  type: knative-workflow
  envs:
  - name: hello
    value: world
states:
- id: foo
  type: noop
`)

    retry(`should list all services`, 30, async () => {
        await sleep(1000)
        listRes = await request(common.config.getDirektivHost())
            .get(`/api/v2/namespaces/${testNamespace}/services`)
        expect(listRes.statusCode).toEqual(200)
        expect(listRes.body).toMatchObject({
            data: [
                {
                    type: 'workflow-service',
                    namespace: 'test-services',
                    filePath: '/w2.yaml',
                    name: 'get',
                    image: 'direktiv/request',
                    error: null,
                    id: 'test-services-get-w2-yaml-9cca18d982',
                    envs: [
                        {
                            name: "hello",
                            value: "world"
                        }
                    ],
                },
            ]
        })
    })


    common.helpers.itShouldUpdateFile(it, expect, testNamespace,
        "/w2.yaml", `
description: something
functions:
- id: get123
  image: direktiv/request
  type: knative-workflow
  envs:
  - name: hello
    value: world
states:
- id: foo
  type: noop
`)


    retry(`should list all services`, 30, async () => {
        await sleep(1000)
        listRes = await request(common.config.getDirektivHost())
            .get(`/api/v2/namespaces/${testNamespace}/services`)
        expect(listRes.statusCode).toEqual(200)
        expect(listRes.body).toMatchObject({
            data: [
                {
                    type: 'workflow-service',
                    namespace: 'test-services',
                    filePath: '/w2.yaml',
                    name: 'get123',
                    image: 'direktiv/request',
                    error: null,
                    id: 'test-services-get123-w2-yaml-376bab406e',
                    envs: [
                        {
                            name: "hello",
                            value: "world"
                        }
                    ],
                },
            ]
        })
    })


});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}