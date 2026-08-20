package com.medcore.features.accountant.service.impl;

import com.medcore.common.exception.BusinessException;
import com.medcore.common.exception.ResourceNotFoundException;
import com.medcore.common.response.ApiResponse;
import com.medcore.common.response.PageResponse;
import com.medcore.common.security.TenantContextService;

import com.medcore.features.accountant.dto.request.CreateAccountantRequest;
import com.medcore.features.accountant.dto.request.UpdateAccountantRequest;
import com.medcore.features.accountant.dto.response.AccountantDashboardResponse;
import com.medcore.features.accountant.dto.response.AccountantResponse;
import com.medcore.features.accountant.dto.response.FinancialReportResponse;
import com.medcore.features.accountant.dto.response.FinancialSummaryResponse;
import com.medcore.features.accountant.dto.response.PaymentMethodCollectionResponse;
import com.medcore.features.accountant.entity.Accountant;
import com.medcore.features.accountant.enums.AccountantStatus;
import com.medcore.features.accountant.mapper.AccountantMapper;
import com.medcore.features.accountant.repository.AccountantRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import com.medcore.features.billing.dto.request.PaymentRequest;
import com.medcore.features.billing.dto.response.BillResponse;
import com.medcore.features.billing.dto.response.PaymentResponse;
import com.medcore.features.billing.enums.BillingStatus;
import com.medcore.features.billing.enums.PaymentMethod;
import com.medcore.features.billing.repository.BillRepository;
import com.medcore.features.billing.service.BillingService;

import com.medcore.features.hospital.entity.Hospital;
import com.medcore.features.user.entity.Role;
import com.medcore.features.user.entity.User;
import com.medcore.features.user.enums.RoleName;
import com.medcore.features.user.repository.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountantServiceImplTest {

    @Mock
    private AccountantRepository accountantRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountantMapper accountantMapper;

    @Mock
    private BillingService billingService;

    @Mock
    private BillRepository billRepository;

    @Mock
    private TenantContextService tenantContextService;

    @InjectMocks
    private AccountantServiceImpl accountantService;

    private User user;
    private Accountant accountant;
    private Hospital hospital;
    private AccountantResponse accountantResponse;

    @BeforeEach
    void setUp() {

        hospital = new Hospital();
        hospital.setId(1L);

        Role role = new Role();
        role.setName(RoleName.ACCOUNTANT);

        user = new User();
        user.setId(10L);
        user.setEmail("accountant@test.com");
        user.setRole(role);
        user.setHospital(hospital);

        accountant = new Accountant();
        accountant.setId(100L);
        accountant.setUser(user);
        accountant.setHospital(hospital);
        accountant.setStatus(AccountantStatus.ACTIVE);

        accountantResponse = AccountantResponse.builder()
                .id(100L)
                .build();

        when(tenantContextService.getCurrentHospitalId())
                .thenReturn(1L);

        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        "accountant@test.com",
                        null,
                        List.of()
                )
        );
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }


     // CREATE ACCOUNTANT
 
    @Test
    void createAccountant_shouldCreateSuccessfully() {

        CreateAccountantRequest request =
                new CreateAccountantRequest();

        request.setUserId(10L);

        when(userRepository.findById(10L))
                .thenReturn(Optional.of(user));

        when(accountantRepository
                .existsByUserIdAndDeletedAtIsNull(10L))
                .thenReturn(false);

        when(accountantMapper.toEntity(request, user))
                .thenReturn(accountant);

        when(accountantRepository.save(accountant))
                .thenReturn(accountant);

        when(accountantMapper.toResponse(accountant))
                .thenReturn(accountantResponse);

        ApiResponse<AccountantResponse> response =
                accountantService.createAccountant(request);

        assertTrue(response.isSuccess());
        assertEquals(
                "Accountant created successfully",
                response.getMessage()
        );
        assertEquals(
                accountantResponse,
                response.getData()
        );

        assertEquals(
                AccountantStatus.ACTIVE,
                accountant.getStatus()
        );

        verify(accountantRepository).save(accountant);
    }


    @Test
    void createAccountant_shouldThrowWhenUserNotFound() {

        CreateAccountantRequest request =
                new CreateAccountantRequest();

        request.setUserId(10L);

        when(userRepository.findById(10L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> accountantService.createAccountant(request)
        );

        verify(accountantRepository, never())
                .save(any());
    }


    @Test
    void createAccountant_shouldThrowWhenUserRoleIsNotAccountant() {

        CreateAccountantRequest request =
                new CreateAccountantRequest();

        request.setUserId(10L);

        Role role = new Role();
        role.setName(RoleName.DOCTOR);

        user.setRole(role);

        when(userRepository.findById(10L))
                .thenReturn(Optional.of(user));

        assertThrows(
                BusinessException.class,
                () -> accountantService.createAccountant(request)
        );

        verify(accountantRepository, never())
                .save(any());
    }


    @Test
    void createAccountant_shouldThrowWhenUserBelongsToAnotherHospital() {

        CreateAccountantRequest request =
                new CreateAccountantRequest();

        request.setUserId(10L);

        Hospital anotherHospital = new Hospital();
        anotherHospital.setId(99L);

        user.setHospital(anotherHospital);

        when(userRepository.findById(10L))
                .thenReturn(Optional.of(user));

        assertThrows(
                BusinessException.class,
                () -> accountantService.createAccountant(request)
        );

        verify(accountantRepository, never())
                .save(any());
    }


    @Test
    void createAccountant_shouldThrowWhenAccountantAlreadyExists() {

        CreateAccountantRequest request =
                new CreateAccountantRequest();

        request.setUserId(10L);

        when(userRepository.findById(10L))
                .thenReturn(Optional.of(user));

        when(accountantRepository
                .existsByUserIdAndDeletedAtIsNull(10L))
                .thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> accountantService.createAccountant(request)
        );

        verify(accountantRepository, never())
                .save(any());
    }


     // GET ACCOUNTANT
 
    @Test
    void getAccountantById_shouldReturnAccountant() {

        when(accountantRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(100L, 1L))
                .thenReturn(Optional.of(accountant));

        when(accountantMapper.toResponse(accountant))
                .thenReturn(accountantResponse);

        ApiResponse<AccountantResponse> response =
                accountantService.getAccountantById(100L);

        assertTrue(response.isSuccess());
        assertEquals(accountantResponse, response.getData());
    }


    @Test
    void getAccountantById_shouldThrowWhenNotFound() {

        when(accountantRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(100L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> accountantService.getAccountantById(100L)
        );
    }


     // GET ALL
 
    @Test
    void getAllAccountants_shouldReturnAccountants() {

        when(accountantRepository
                .findByHospitalIdAndDeletedAtIsNull(1L))
                .thenReturn(List.of(accountant));

        when(accountantMapper.toResponse(accountant))
                .thenReturn(accountantResponse);

        ApiResponse<List<AccountantResponse>> response =
                accountantService.getAllAccountants();

        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());
        assertEquals(
                accountantResponse,
                response.getData().get(0)
        );
    }


     // UPDATE
 
    @Test
    void updateAccountant_shouldUpdateSuccessfully() {

        UpdateAccountantRequest request =
                new UpdateAccountantRequest();

        when(accountantRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(100L, 1L))
                .thenReturn(Optional.of(accountant));

        when(accountantRepository.save(accountant))
                .thenReturn(accountant);

        when(accountantMapper.toResponse(accountant))
                .thenReturn(accountantResponse);

        ApiResponse<AccountantResponse> response =
                accountantService.updateAccountant(
                        100L,
                        request
                );

        assertTrue(response.isSuccess());

        verify(accountantMapper)
                .updateEntity(accountant, request);

        verify(accountantRepository)
                .save(accountant);
    }


     // DELETE
 
    @Test
    void deleteAccountant_shouldSoftDelete() {

        when(accountantRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(100L, 1L))
                .thenReturn(Optional.of(accountant));

        ApiResponse<Void> response =
                accountantService.deleteAccountant(100L);

        assertTrue(response.isSuccess());
        assertNotNull(accountant.getDeletedAt());

        verify(accountantRepository)
                .save(accountant);
    }


     // ACTIVATE / DEACTIVATE
 
    @Test
    void activateAccountant_shouldSetActiveStatus() {

        accountant.setStatus(AccountantStatus.INACTIVE);

        when(accountantRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(100L, 1L))
                .thenReturn(Optional.of(accountant));

        when(accountantRepository.save(accountant))
                .thenReturn(accountant);

        when(accountantMapper.toResponse(accountant))
                .thenReturn(accountantResponse);

        ApiResponse<AccountantResponse> response =
                accountantService.activateAccountant(100L);

        assertTrue(response.isSuccess());
        assertEquals(
                AccountantStatus.ACTIVE,
                accountant.getStatus()
        );
    }


    @Test
    void deactivateAccountant_shouldSetInactiveStatus() {

        when(accountantRepository
                .findByIdAndHospitalIdAndDeletedAtIsNull(100L, 1L))
                .thenReturn(Optional.of(accountant));

        when(accountantRepository.save(accountant))
                .thenReturn(accountant);

        when(accountantMapper.toResponse(accountant))
                .thenReturn(accountantResponse);

        ApiResponse<AccountantResponse> response =
                accountantService.deactivateAccountant(100L);

        assertTrue(response.isSuccess());
        assertEquals(
                AccountantStatus.INACTIVE,
                accountant.getStatus()
        );
    }


     // FINANCIAL SUMMARY
 
    @Test
    void getFinancialSummary_shouldReturnCorrectSummary() {

        mockActiveAccountant();

        Object[] result = new Object[]{
                10L,
                new BigDecimal("50000.00"),
                new BigDecimal("30000.00")
        };

        when(billRepository.getFinancialSummary(
                1L,
                BillingStatus.CANCELLED
        )).thenReturn(result);

        ApiResponse<FinancialSummaryResponse> response =
                accountantService.getFinancialSummary();

        assertTrue(response.isSuccess());

        FinancialSummaryResponse data =
                response.getData();

        assertEquals(10L, data.getTotalBills());
        assertEquals(
                new BigDecimal("50000.00"),
                data.getTotalBilledAmount()
        );
        assertEquals(
                new BigDecimal("30000.00"),
                data.getTotalPaidAmount()
        );
        assertEquals(
                new BigDecimal("20000.00"),
                data.getTotalOutstandingAmount()
        );
    }


     // FINANCIAL REPORT
 
    @Test
    void getFinancialReport_shouldThrowWhenDateRangeInvalid() {

        mockActiveAccountant();

        assertThrows(
                BusinessException.class,
                () -> accountantService.getFinancialReport(
                        LocalDate.of(2026, 8, 20),
                        LocalDate.of(2026, 8, 10)
                )
        );

        verify(billRepository, never())
                .getFinancialReport(
                        anyLong(),
                        any(),
                        any(),
                        any()
                );
    }


    @Test
    void getFinancialReport_shouldReturnReport() {

        mockActiveAccountant();

        Object[] result = new Object[]{
                5L,
                new BigDecimal("25000.00"),
                new BigDecimal("15000.00")
        };

        when(billRepository.getFinancialReport(
                eq(1L),
                any(),
                any(),
                eq(BillingStatus.CANCELLED)
        )).thenReturn(result);

        ApiResponse<FinancialReportResponse> response =
                accountantService.getFinancialReport(
                        LocalDate.of(2026, 8, 1),
                        LocalDate.of(2026, 8, 20)
                );

        assertTrue(response.isSuccess());

        FinancialReportResponse data =
                response.getData();

        assertEquals(5L, data.getTotalBills());
        assertEquals(
                new BigDecimal("25000.00"),
                data.getTotalBilledAmount()
        );
        assertEquals(
                new BigDecimal("15000.00"),
                data.getTotalPaidAmount()
        );
        assertEquals(
                new BigDecimal("10000.00"),
                data.getTotalOutstandingAmount()
        );
    }


     // PAYMENT METHOD COLLECTION
 
    @Test
    void getPaymentMethodCollection_shouldReturnCollection() {

        mockActiveAccountant();

        Object[] row = new Object[]{
                PaymentMethod.CASH,
                3L,
                new BigDecimal("10000.00")
        };

        when(billRepository.getPaymentMethodCollection(
                1L,
                BillingStatus.CANCELLED
        )).thenReturn(List.<Object[]>of(row));

        ApiResponse<List<PaymentMethodCollectionResponse>> response =
                accountantService.getPaymentMethodCollection();

        assertTrue(response.isSuccess());
        assertEquals(1, response.getData().size());

        PaymentMethodCollectionResponse data =
                response.getData().get(0);

        assertEquals(PaymentMethod.CASH, data.getPaymentMethod());
        assertEquals(3L, data.getTransactionCount());
        assertEquals(
                new BigDecimal("10000.00"),
                data.getCollectedAmount()
        );
    }


     // DASHBOARD
 
    @Test
    void getDashboard_shouldReturnDashboard() {

        mockActiveAccountant();

        Object[] summary = new Object[]{
                10L,
                new BigDecimal("50000.00"),
                new BigDecimal("30000.00")
        };

        when(billRepository.getFinancialSummary(
                1L,
                BillingStatus.CANCELLED
        )).thenReturn(summary);

        when(billRepository
                .countByHospitalIdAndStatusInAndDeletedAtIsNull(
                        eq(1L),
                        anyList()
                ))
                .thenReturn(4L);

        Object[] paymentRow = new Object[]{
                PaymentMethod.UPI,
                5L,
                new BigDecimal("20000.00")
        };

        when(billRepository.getPaymentMethodCollection(
                1L,
                BillingStatus.CANCELLED
        )).thenReturn(List.<Object[]>of(paymentRow));

        ApiResponse<AccountantDashboardResponse> response =
                accountantService.getDashboard();

        assertTrue(response.isSuccess());

        AccountantDashboardResponse data =
                response.getData();

        assertEquals(10L, data.getTotalBills());
        assertEquals(
                new BigDecimal("50000.00"),
                data.getTotalBilledAmount()
        );
        assertEquals(
                new BigDecimal("30000.00"),
                data.getTotalPaidAmount()
        );
        assertEquals(
                new BigDecimal("20000.00"),
                data.getTotalOutstandingAmount()
        );
        assertEquals(4L, data.getOutstandingBills());

        assertEquals(
                1,
                data.getPaymentMethodCollection().size()
        );
    }


     // PAY BILL
 
    @Test
    void payBill_shouldDelegateToBillingService() {

        mockActiveAccountant();

        PaymentRequest request =
                new PaymentRequest();

        PaymentResponse paymentResponse =
                PaymentResponse.builder()
                        .billId(100L)
                        .paidNow(new BigDecimal("500.00"))
                        .build();

        ApiResponse<PaymentResponse> expected =
                ApiResponse.<PaymentResponse>builder()
                        .success(true)
                        .message("Payment successful")
                        .data(paymentResponse)
                        .build();

        when(billingService.payBill(100L, request))
                .thenReturn(expected);

        ApiResponse<PaymentResponse> response =
                accountantService.payBill(
                        100L,
                        request
                );

        assertTrue(response.isSuccess());
        assertEquals(paymentResponse, response.getData());

        verify(billingService)
                .payBill(100L, request);
    }


     // HELPER
 
    private void mockActiveAccountant() {

        when(userRepository.findByEmail(anyString()))
                .thenReturn(Optional.of(user));

        when(accountantRepository
                .findByUserIdAndDeletedAtIsNull(10L))
                .thenReturn(Optional.of(accountant));
    }
}