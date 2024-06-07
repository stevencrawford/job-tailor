import { Injectable } from '@nestjs/common';
import { PrismaRepository } from '../prisma.service';
import { Connector, UserConnectorConfig } from '@prisma/client';

@Injectable()
export class ConnectorRepository {
  constructor(
    private _connector: PrismaRepository<'connector'>,
    private _userConnectorConfig: PrismaRepository<'userConnectorConfig'>,
  ) {
  }

  async findAll(): Promise<Connector[]> {
    return this._connector.model.connector.findMany({
      where: {
        status: 'ONLINE' as const,
      },
    });
  }

  async findUserConfigsByConnectorName(
    connectorName: string,
  ): Promise<(UserConnectorConfig & { user: { id: string, name: string } })[]> {
    return this._userConnectorConfig.model.userConnectorConfig.findMany({
      where: {
        connector: {
          name: connectorName,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async updateLastSuccess(
    connectorName: string,
    lastSuccess: Date,
  ): Promise<void> {
    await this._connector.model.connector.update({
      where: {
        name: connectorName,
      },
      data: {
        lastSuccess,
      },
    });
  }

  // Add other CRUD methods as needed
  // async create(data: Omit<Connector, 'id'>): Promise<Connector> {
  //   return this._connector.model.connector.create({ data });
  // }

  // async findOne(id: string): Promise<Connector | null> {
  //   return this._connector.model.connector.findUnique({ where: { id } });
  // }

  // async update(id: string, data: Partial<Connector>): Promise<Connector> {
  //   return this._connector.model.connector.update({ where: { id }, data });
  // }

  // async delete(id: string): Promise<Connector> {
  //   return this._connector.model.connector.delete({ where: { id } });
  // }
}
