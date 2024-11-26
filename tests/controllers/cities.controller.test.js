const citiesController = require('../../src/controllers/cities.controller');
const citiesService = require('../../src/services/cities.service');
const commonHelper = require('../../src/helpers/common.helper');

jest.mock('../../src/services/cities.service');
jest.mock('../../src/helpers/common.helper');

describe('Cities Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {}, params: {} };
    res = {
      statusCode: null,
      message: null,
      data: null,
    };
    next = jest.fn();

    jest.clearAllMocks();

    commonHelper.customErrorHandler.mockImplementation((response, message, statusCode) => {
      response.statusCode = statusCode;
      response.message = message;
      return response;
    });
  });

  describe('create', () => {
    it('should successfully create a city', async () => {
      const city = 'New York';
      const createdCity = { id: 1, name: city };
      req.body.city = city;

      citiesService.create.mockResolvedValue(createdCity);

      await citiesController.create(req, res, next);

      expect(citiesService.create).toHaveBeenCalledWith(city);
      expect(res.statusCode).toBe(201);
      expect(res.message).toBe('City added successfully');
      expect(res.data).toEqual(createdCity);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when creating a city', async () => {
      const city = 'New York';
      const errorMessage = 'City already exists';
      const errorStatus = 409;
      req.body.city = city;

      citiesService.create.mockRejectedValue({ message: errorMessage, statusCode: errorStatus });

      await citiesController.create(req, res, next);

      expect(citiesService.create).toHaveBeenCalledWith(city);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, errorStatus);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should successfully fetch all cities', async () => {
      const mockCities = [
        { id: 1, name: 'New York' },
        { id: 2, name: 'Los Angeles' },
      ];

      citiesService.getAll.mockResolvedValue(mockCities);

      await citiesController.getAll(req, res, next);

      expect(citiesService.getAll).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.message).toBe('Fetched roles successfully');
      expect(res.data).toEqual(mockCities);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when fetching cities', async () => {
      const errorMessage = 'No cities found';
      const errorStatus = 404;

      citiesService.getAll.mockRejectedValue({ message: errorMessage, statusCode: errorStatus });

      await citiesController.getAll(req, res, next);

      expect(citiesService.getAll).toHaveBeenCalled();
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, errorStatus);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully delete a city', async () => {
      const cityId = 1;
      req.params.id = cityId;

      citiesService.remove.mockResolvedValue();

      await citiesController.remove(req, res, next);

      expect(citiesService.remove).toHaveBeenCalledWith(cityId);
      expect(res.statusCode).toBe(204);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors when deleting a city', async () => {
      const cityId = 1;
      const errorMessage = 'City not found';
      const errorStatus = 404;
      req.params.id = cityId;

      citiesService.remove.mockRejectedValue({ message: errorMessage, statusCode: errorStatus });

      await citiesController.remove(req, res, next);

      expect(citiesService.remove).toHaveBeenCalledWith(cityId);
      expect(commonHelper.customErrorHandler).toHaveBeenCalledWith(res, errorMessage, errorStatus);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
