import { FilterQuery, Query } from 'mongoose';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  // Search by matching against the searchable fields (case-insensitive)
  search(searchableFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' }, // Case-insensitive regex
        })),
      });
    }
    return this;
  }

  // Filter by other query parameters, excluding searchTerm, sort, limit, etc.
  filter() {
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields'];
    const queryObj = { ...this.query };
    excludeFields.forEach((el) => delete queryObj[el]);

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  // Handle filtering by moodTags with case-insensitive matching
  filterByMoodTag(moodTags: string[]) {
    if (moodTags && moodTags.length > 0) {
      const regexArray = moodTags.map((tag) => new RegExp(tag, 'i')); // Case-insensitive
      this.modelQuery = this.modelQuery.where('moodTag').in(regexArray);
    }
    return this;
  }

  // Sorting (by price, latest, popularity, etc.)
  sort() {
    const sort = this.query?.sort as string;
    if (sort) {
      const [field, direction] = sort.split(',');
      const sortDirection = direction === 'desc' ? -1 : 1;
      this.modelQuery = this.modelQuery.sort({ [field]: sortDirection });
    } else {
      this.modelQuery = this.modelQuery.sort({ createdAt: -1 });
    }

    return this;
  }

  // Pagination
  paginate(defaultLimit = 10) {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || defaultLimit;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  // Field selection (for projections)
  fields() {
    const fields = (this.query?.fields as string)?.split(',')?.join(' ') || '-__v';
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  // Count the total number of documents matching the query (for pagination)
  async countTotal() {
    try {
      const totalQueries = this.modelQuery.getFilter();
      const total = await this.modelQuery.model.countDocuments(totalQueries);
      const page = Number(this.query?.page) || 1;
      const limit = Number(this.query?.limit) || 10;
      const totalPage = Math.ceil(total / limit);

      return { page, limit, total, totalPage };
    } catch (error) {
      throw new AppError(StatusCodes.SERVICE_UNAVAILABLE, error as string);
    }
  }
}

export default QueryBuilder;
