import { CustomAuthorizerEvent, CustomAuthorizerResult, CustomAuthorizerHandler } from 'aws-lambda'
import 'source-map-support/register'
//
import { decode, verify } from 'jsonwebtoken'
// import {JwtToken} from '../../auth/JwtToken'  //SS - Commented
import { Jwt } from '../../auth/Jwt'
import { createLogger } from '../../utils/logger'
import { JwtPayload } from '../../auth/JwtPayload'
//
const auth0Secret = process.env.AUTH_0_SECRET
// import { verify, decode } from 'jsonwebtoken'

// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'

//
const logger = createLogger('auth')
//
// const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'

// export const handler = async (  event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
export const handler: CustomAuthorizerHandler = async(event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  logger.info('Authorizing a user', event.authorizationToken)  //SS - uncommented
  try {
    const jwtToken = await verifyToken(event.authorizationToken) //SS - uncommented
    logger.info('User was authorized', jwtToken) //SS - uncommented
    // const decodedToken = verifyToken(event.authorizationToken) //SS - commented
    // console.log('user was authorized A: ', decodedToken) //SS - commented

    return {
      // principalId: decodedToken.sub, //SS - Commented
      // principalId: 'user',
      // principalId: decodedToken.payload.sub,
      principalId: jwtToken.sub, //SS - Modified
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message }) //SS - Uncommented

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

//SS - Commented - Start
// function verifyToken (authHeader:string) : JwtToken{
// // function verifyToken (authHeader:string){
//     if (!authHeader)
//         throw new Error('No authentication header')

//     if (!authHeader.toLowerCase().startsWith('bearer '))
//       throw new Error('Invalid authentication header')

//     console.log(authHeader)
//     const split = authHeader.split(' ')
//     const token = split[1]
//     //
//     //
//     return verify(token, auth0Secret) as JwtToken
//     // if (token != '123')
//     //   throw new Error('Invalid token')
// }

//SS - Commented - End

// SS - Uncommented - Start
async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  logger.info(jwt)
  
  if (!authHeader)
      throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')
  // TODO: Implement token verification

  // console.log(secret)
  // const split = authHeader.split(' ')
  // const token = split[1]
  // console.log(token)
  // console.log('hi')

  return verify(token, auth0Secret, {algorithms: ['HS256']}) as JwtPayload
  // return verify(token, secret) as JwtToken //SS - Commented
}


function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
// SS - Uncommented - End