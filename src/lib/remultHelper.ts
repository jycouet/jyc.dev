import { repo, type ClassType, type EntityFilter, type ErrorInfo } from 'remult'

export function isError<T>(object: any): object is ErrorInfo<T> {
  return object
}

export type PaginatorOf<T extends (...args: any) => any> = Awaited<
  ReturnType<ReturnType<T>['paginator']>
>

/**
 * { where: containsWords(Package, ['name', 'title'], search)}
 */
export const containsWords = <Entity>(
  ent: ClassType<Entity>,
  fields: (keyof Entity)[],
  search: string,
): EntityFilter<Entity> => {
  const sSplitted = search.split(' ').filter((s) => s.length > 0)

  const fieldsMetadata = repo(ent).metadata.fields

  if (fields.length === 1) {
    return {
      $and: sSplitted.map((s) => ({ [fieldsMetadata[fields[0]].key]: { $contains: s } })),
    } as EntityFilter<Entity>
  }

  return {
    $or: fields.map((f) => {
      return { $and: sSplitted.map((s) => ({ [fieldsMetadata[f].key]: { $contains: s } })) }
    }),
  } as EntityFilter<Entity>
}
