import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract JWT from Authorization header (Bearer token)
            ignoreExpiration: false,
            secretOrKey: String(process.env.JWT_SECRET),
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username }; // Returning user information from JWT payload
    }
}
