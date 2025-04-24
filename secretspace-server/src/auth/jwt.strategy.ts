import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.jwt,
            ]),
            ignoreExpiration: false,
            secretOrKey: String(process.env.JWT_SECRET),
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.username };
    }
}